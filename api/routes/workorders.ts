import { Router, type Response } from 'express';
import db from '../db/index.js';
import { generateId } from '../utils/common.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import cron from 'node-cron';
import { broadcastToRole, broadcastNotification } from '../services/websocket.js';

const router = Router();

router.use(authMiddleware);

cron.schedule('*/5 * * * *', () => {
  console.log('Checking work order escalation...');
  checkWorkOrderEscalation();
});

function checkWorkOrderEscalation() {
  try {
    const pendingOrders: any[] = db.prepare(`
      SELECT * FROM work_orders 
      WHERE status = 'pending' 
        AND escalated = 0
        AND julianday('now') - julianday(created_at) > 0.5
    `).all();

    for (const order of pendingOrders) {
      db.prepare(`
        UPDATE work_orders 
        SET escalated = 1, updated_at = datetime('now')
        WHERE id = ?
      `).run(order.id);

      const existing: any = db.prepare(`
        SELECT COUNT(*) as count FROM notifications 
        WHERE content LIKE ? AND type = 'workorder'
      `).get(`%${order.id}%`);

      if (existing && existing.count > 0) {
        console.log(`Work order ${order.id} already has escalation notification, skipping DB insert`);
      } else {
        const admins: any[] = db.prepare("SELECT * FROM users WHERE role = 'admin'").all();
        for (const admin of admins) {
          const notificationId = generateId('notif');
          db.prepare(`
            INSERT INTO notifications (id, user_id, title, content, type)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            notificationId,
            admin.id,
            '工单升级通知',
            `工单【${order.title}】超过12小时未接单，已升级通知主管处理`,
            'workorder'
          );

          broadcastNotification(admin.id, {
            id: notificationId,
            title: '工单升级通知',
            content: `工单【${order.title}】超过12小时未接单，已升级通知主管处理`,
            type: 'workorder',
            workOrderId: order.id,
          });
        }
      }

      broadcastToRole('admin', {
        type: 'workorder_escalated',
        workOrderId: order.id,
        title: order.title,
        priority: order.priority,
        message: `工单【${order.title}】超过12小时未接单，已自动升级`,
      });

      console.log(`Work order ${order.id} escalated and pushed via WebSocket`);
    }
  } catch (error) {
    console.error('Error checking work order escalation:', error);
  }
}

router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { status, type } = req.query;

    let query = `
      SELECT wo.*, u.avatar as user_avatar 
      FROM work_orders wo 
      LEFT JOIN users u ON wo.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (role === 'user') {
      query += ' AND wo.user_id = ?';
      params.push(userId);
    } else if (role === 'maintainer') {
      query += ' AND (wo.user_id = ? OR wo.assignee = ?)';
      params.push(userId, userId);
    }

    if (status) {
      query += ' AND wo.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND wo.type = ?';
      params.push(type);
    }

    query += ' ORDER BY wo.created_at DESC';

    const orders: any[] = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: orders.map((o: any) => ({
        id: o.id,
        stationId: o.station_id,
        stationName: o.station_name,
        userId: o.user_id,
        userName: o.user_name,
        type: o.type,
        title: o.title,
        description: o.description,
        status: o.status,
        priority: o.priority,
        assignee: o.assignee,
        assigneeName: o.assignee_name,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        completedAt: o.completed_at,
        escalated: o.escalated === 1,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取工单列表失败' });
  }
});

router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const order: any = db.prepare('SELECT * FROM work_orders WHERE id = ?').get(id);

    if (!order) {
      res.status(404).json({ success: false, error: '工单不存在' });
      return;
    }

    const history: any[] = db.prepare(`
      SELECT * FROM work_order_history WHERE order_id = ? ORDER BY time ASC
    `).all(id);

    res.json({
      success: true,
      data: {
        id: order.id,
        stationId: order.station_id,
        stationName: order.station_name,
        userId: order.user_id,
        userName: order.user_name,
        type: order.type,
        title: order.title,
        description: order.description,
        status: order.status,
        priority: order.priority,
        assignee: order.assignee,
        assigneeName: order.assignee_name,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        completedAt: order.completed_at,
        escalated: order.escalated === 1,
        history: history.map((h: any) => ({
          time: h.time,
          action: h.action,
          operator: h.operator,
          remark: h.remark,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取工单详情失败' });
  }
});

router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const { stationId, stationName, type, title, description, priority = 'medium' } = req.body;

    if (!stationId || !type || !title) {
      res.status(400).json({ success: false, error: '请填写必要信息' });
      return;
    }

    const orderId = generateId('wo');

    db.prepare(`
      INSERT INTO work_orders (id, station_id, station_name, user_id, user_name, type, title, description, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, stationId, stationName, userId, user.name, type, title, description, priority);

    db.prepare(`
      INSERT INTO work_order_history (order_id, action, operator, remark)
      VALUES (?, ?, ?, ?)
    `).run(orderId, '用户创建工单', user.name, description);

    const maintainers: any[] = db.prepare("SELECT * FROM users WHERE role = 'maintainer' LIMIT 3").all();
    for (const maintainer of maintainers) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, content, type)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        generateId('notif'),
        maintainer.id,
        '新工单待分配',
        `${user.name}提交了新工单：${title}`,
        'workorder'
      );
    }

    res.status(201).json({ success: true, data: { id: orderId }, message: '工单创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '创建工单失败' });
  }
});

router.put('/:id/assign', roleMiddleware(['admin', 'maintainer']), (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { assignee, assigneeName } = req.body;
    const userId = req.user?.id;
    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    db.prepare(`
      UPDATE work_orders 
      SET assignee = ?, assignee_name = ?, status = 'assigned', updated_at = datetime('now')
      WHERE id = ?
    `).run(assignee, assigneeName, id);

    db.prepare(`
      INSERT INTO work_order_history (order_id, action, operator, remark)
      VALUES (?, ?, ?, ?)
    `).run(id, '分配工单', user.name, `分配给 ${assigneeName}`);

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      generateId('notif'),
      assignee,
      '工单分配通知',
      `您被分配了新工单，请及时处理`,
      'workorder'
    );

    res.json({ success: true, message: '工单分配成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '分配工单失败' });
  }
});

router.put('/:id/accept', roleMiddleware(['maintainer']), (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    db.prepare(`
      UPDATE work_orders 
      SET status = 'processing', updated_at = datetime('now')
      WHERE id = ? AND (assignee = ? OR assignee IS NULL)
    `).run(id, userId);

    db.prepare(`
      INSERT INTO work_order_history (order_id, action, operator, remark)
      VALUES (?, ?, ?, ?)
    `).run(id, '接单', user.name, '运维人员已接单');

    const order: any = db.prepare('SELECT * FROM work_orders WHERE id = ?').get(id);
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      generateId('notif'),
      order.user_id,
      '工单进度更新',
      `您的工单【${order.title}】已被运维人员接单`,
      'workorder'
    );

    res.json({ success: true, message: '接单成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '接单失败' });
  }
});

router.put('/:id/complete', roleMiddleware(['maintainer']), (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    const userId = req.user?.id;
    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    db.prepare(`
      UPDATE work_orders 
      SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(id);

    db.prepare(`
      INSERT INTO work_order_history (order_id, action, operator, remark)
      VALUES (?, ?, ?, ?)
    `).run(id, '完成工单', user.name, remark || '工单已处理完成');

    const order: any = db.prepare('SELECT * FROM work_orders WHERE id = ?').get(id);
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      generateId('notif'),
      order.user_id,
      '工单完成通知',
      `您的工单【${order.title}】已处理完成`,
      'workorder'
    );

    res.json({ success: true, message: '工单已完成' });
  } catch (error) {
    res.status(500).json({ success: false, error: '完成工单失败' });
  }
});

router.put('/:id/escalate', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    const order: any = db.prepare('SELECT * FROM work_orders WHERE id = ?').get(id);
    if (!order) {
      res.status(404).json({ success: false, error: '工单不存在' });
      return;
    }

    if (order.escalated === 1) {
      res.json({ success: true, message: '工单已处于升级状态', data: { alreadyEscalated: true } });
      return;
    }

    db.prepare(`
      UPDATE work_orders 
      SET escalated = 1, updated_at = datetime('now')
      WHERE id = ?
    `).run(id);

    db.prepare(`
      INSERT INTO work_order_history (order_id, action, operator, remark)
      VALUES (?, ?, ?, ?)
    `).run(id, '升级工单', user.name, '用户手动升级工单');

    const existing: any = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE content LIKE ? AND type = 'workorder'
    `).get(`%${order.id}%`);

    if (!existing || existing.count === 0) {
      const admins: any[] = db.prepare("SELECT * FROM users WHERE role = 'admin'").all();
      for (const admin of admins) {
        const notificationId = generateId('notif');
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, content, type)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          notificationId,
          admin.id,
          '工单升级通知',
          `工单【${order.title}】被${user.name}手动升级，请主管关注`,
          'workorder'
        );

        broadcastNotification(admin.id, {
          id: notificationId,
          title: '工单升级通知',
          content: `工单【${order.title}】被${user.name}手动升级，请主管关注`,
          type: 'workorder',
          workOrderId: order.id,
        });
      }
    }

    broadcastToRole('admin', {
      type: 'workorder_escalated',
      workOrderId: order.id,
      title: order.title,
      priority: order.priority,
      message: `工单【${order.title}】被${user.name}手动升级`,
    });

    res.json({ success: true, message: '工单已升级' });
  } catch (error) {
    res.status(500).json({ success: false, error: '升级工单失败' });
  }
});

router.get('/stats/summary', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let whereClause = '';
    const params: any[] = [];

    if (role === 'user') {
      whereClause = 'WHERE user_id = ?';
      params.push(userId);
    } else if (role === 'maintainer') {
      whereClause = 'WHERE user_id = ? OR assignee = ?';
      params.push(userId, userId);
    }

    const stats: any = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM work_orders
      ${whereClause}
    `).get(...params);

    res.json({
      success: true,
      data: {
        total: stats.total || 0,
        pending: stats.pending || 0,
        assigned: stats.assigned || 0,
        processing: stats.processing || 0,
        completed: stats.completed || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取工单统计失败' });
  }
});

export default router;
