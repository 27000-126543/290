import { Router, type Request, type Response } from 'express';
import db from '../db/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { generateId } from '../utils/common.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

export function initSeedData() {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    if (userCount.count > 0) return;

    const adminId = generateId();
    const maintainerId = generateId();
    const userId = generateId();

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, phone, password, role, member_level, total_generation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(adminId, '系统管理员', 'admin', hashPasswordSync('admin123'), 'admin', 'diamond', 500000);
    insertUser.run(maintainerId, '张工', '13900139000', hashPasswordSync('123456'), 'maintainer', 'gold', 80000);
    insertUser.run(userId, '张先生', '13800138000', hashPasswordSync('123456'), 'user', 'silver', 6200);

    const insertStation = db.prepare(`
      INSERT INTO power_stations (id, user_id, name, type, capacity, location, status, inverter_model, panel_count, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStation.run('s1', userId, '家用光伏电站', 'photovoltaic', 8.5, '北京市朝阳区', 'normal', '华为SUN2000-10KTL', 30, '屋顶分布式光伏电站');
    insertStation.run('s2', userId, '小型风力发电站', 'wind', 5.0, '北京市朝阳区', 'normal', '金风科技GW121-2.5MW', 1, '家用小型风力发电机');

    const insertBattery = db.prepare(`
      INSERT INTO batteries (station_id, capacity, current_capacity, soc, health, temperature, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertBattery.run('s1', 20, 14, 70, 95, 25, 'idle');

    const insertStrategy = db.prepare(`
      INSERT INTO charge_strategies (station_id, mode, charge_start_time, charge_end_time, discharge_start_time, discharge_end_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertStrategy.run('s1', 'auto', '00:00', '06:00', '18:00', '22:00');

    const today = new Date().toISOString().split('T')[0];
    const insertHistory = db.prepare(`
      INSERT OR IGNORE INTO history_data (station_id, date, generation, revenue, carbon_reduction, peak_hours)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const gen = 35 + Math.random() * 15;
      insertHistory.run('s1', dateStr, gen, gen * 0.58, gen * 0.785, 3.5);
    }

    console.log('Seed data initialized successfully');
  } catch (error) {
    console.error('Error initializing seed data:', error);
  }
}

function hashPasswordSync(password: string): string {
  const bcrypt = require('bcryptjs');
  return bcrypt.hashSync(password, 10);
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, password, role = 'user' } = req.body;

    if (!name || !phone || !password) {
      res.status(400).json({ success: false, error: '请填写完整信息' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) {
      res.status(400).json({ success: false, error: '该手机号已注册' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateId();

    db.prepare(`
      INSERT INTO users (id, name, phone, password, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, name, phone, hashedPassword, role);

    const token = signToken({ id: userId, phone, role });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: userId, name, phone, role, memberLevel: 'silver', totalGeneration: 0 },
      },
      message: '注册成功',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: '注册失败' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({ success: false, error: '请输入手机号和密码' });
      return;
    }

    const user: any = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) {
      res.status(400).json({ success: false, error: '用户不存在' });
      return;
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      res.status(400).json({ success: false, error: '密码错误' });
      return;
    }

    const token = signToken({ id: user.id, phone: user.phone, role: user.role });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          memberLevel: user.member_level,
          totalGeneration: user.total_generation,
        },
      },
      message: '登录成功',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: '登录失败' });
  }
});

router.post('/logout', (req: AuthRequest, res: Response): void => {
  res.json({ success: true, message: '登出成功' });
});

router.get('/profile', (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未授权' });
      return;
    }

    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        memberLevel: user.member_level,
        totalGeneration: user.total_generation,
        email: user.email,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});

export default router;
