import { Router, type Response } from 'express';
import db from '../db/index.js';
import { generateId, getTodayString } from '../utils/common.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let stations: any[];
    if (role === 'admin') {
      stations = db.prepare(`
        SELECT ps.*, u.name as user_name 
        FROM power_stations ps 
        LEFT JOIN users u ON ps.user_id = u.id
        ORDER BY ps.created_at DESC
      `).all();
    } else {
      stations = db.prepare(`
        SELECT * FROM power_stations WHERE user_id = ? ORDER BY created_at DESC
      `).all(userId);
    }

    res.json({
      success: true,
      data: stations.map((s: any) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        capacity: s.capacity,
        location: s.location,
        status: s.status,
        inverterModel: s.inverter_model,
        panelCount: s.panel_count,
        description: s.description,
        createdAt: s.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取电站列表失败' });
  }
});

router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const station: any = db.prepare('SELECT * FROM power_stations WHERE id = ?').get(id);

    if (!station) {
      res.status(404).json({ success: false, error: '电站不存在' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: station.id,
        name: station.name,
        type: station.type,
        capacity: station.capacity,
        location: station.location,
        installDate: station.install_date,
        status: station.status,
        inverterModel: station.inverter_model,
        panelCount: station.panel_count,
        description: station.description,
        createdAt: station.created_at,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取电站详情失败' });
  }
});

router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    const { name, type, capacity, location, inverterModel, panelCount, description } = req.body;

    if (!name || !type || !capacity) {
      res.status(400).json({ success: false, error: '请填写必要信息' });
      return;
    }

    const stationId = generateId();

    db.prepare(`
      INSERT INTO power_stations (id, user_id, name, type, capacity, location, inverter_model, panel_count, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(stationId, userId, name, type, capacity, location, inverterModel, panelCount, description);

    db.prepare(`
      INSERT INTO batteries (station_id, capacity, current_capacity, soc, health, temperature, status)
      VALUES (?, 20, 14, 70, 95, 25, 'idle')
    `).run(stationId);

    db.prepare(`
      INSERT INTO charge_strategies (station_id, mode, charge_start_time, charge_end_time, discharge_start_time, discharge_end_time)
      VALUES (?, 'auto', '00:00', '06:00', '18:00', '22:00')
    `).run(stationId);

    res.status(201).json({ success: true, data: { id: stationId }, message: '电站添加成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '添加电站失败' });
  }
});

router.put('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { name, type, capacity, location, status, inverterModel, panelCount, description } = req.body;

    db.prepare(`
      UPDATE power_stations 
      SET name = ?, type = ?, capacity = ?, location = ?, status = ?, inverter_model = ?, panel_count = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, type, capacity, location, status, inverterModel, panelCount, description, id);

    res.json({ success: true, message: '电站信息更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '更新电站信息失败' });
  }
});

router.delete('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM power_stations WHERE id = ?').run(id);
    res.json({ success: true, message: '电站删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除电站失败' });
  }
});

router.get('/:id/realtime', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;

    let latestData: any = db.prepare(`
      SELECT * FROM realtime_data 
      WHERE station_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `).get(id);

    if (!latestData) {
      const station: any = db.prepare('SELECT * FROM power_stations WHERE id = ?').get(id);
      const power = station.type === 'photovoltaic' ? 3 + Math.random() * 4 : 2 + Math.random() * 3;
      
      latestData = {
        id: 0,
        station_id: id,
        power: power,
        daily_generation: 25 + Math.random() * 15,
        total_generation: 5000 + Math.random() * 2000,
        temperature: 35 + Math.random() * 15,
        inverter_status: '正常运行',
        voltage: 215 + Math.random() * 10,
        current: power / 220 * 1000,
        efficiency: 80 + Math.random() * 15,
        timestamp: new Date().toISOString(),
      };
    }

    res.json({
      success: true,
      data: {
        power: latestData.power,
        dailyGeneration: latestData.daily_generation,
        totalGeneration: latestData.total_generation,
        temperature: latestData.temperature,
        inverterStatus: latestData.inverter_status,
        voltage: latestData.voltage,
        current: latestData.current,
        efficiency: latestData.efficiency,
        timestamp: latestData.timestamp,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取实时数据失败' });
  }
});

router.post('/:id/realtime', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { power, dailyGeneration, totalGeneration, temperature, inverterStatus, voltage, current, efficiency } = req.body;

    db.prepare(`
      INSERT INTO realtime_data (station_id, power, daily_generation, total_generation, temperature, inverter_status, voltage, current, efficiency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, power, dailyGeneration, totalGeneration, temperature, inverterStatus || '正常运行', voltage || 220, current || 0, efficiency || 85);

    if (temperature > 70) {
      const station: any = db.prepare('SELECT * FROM power_stations WHERE id = ?').get(id);
      const alarmId = generateId('a');
      db.prepare(`
        INSERT INTO alarms (id, station_id, station_name, type, level, message)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(alarmId, id, station.name, 'temperature', 'error', `逆变器温度过高: ${temperature.toFixed(1)}°C`);

      const workOrderId = generateId('wo');
      db.prepare(`
        INSERT INTO work_orders (id, station_id, station_name, user_id, user_name, type, title, description, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(workOrderId, id, station.name, station.user_id, '系统自动', 'repair', '逆变器温度过高告警', `检测到逆变器温度达到${temperature.toFixed(1)}°C，请及时处理`, 'high');

      db.prepare(`
        INSERT INTO work_order_history (order_id, action, operator, remark)
        VALUES (?, ?, ?, ?)
      `).run(workOrderId, '系统自动创建', 'system', '温度异常自动触发工单');
    }

    res.json({ success: true, message: '实时数据上报成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '上报实时数据失败' });
  }
});

router.get('/:id/history', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { days = '7' } = req.query;

    const history: any[] = db.prepare(`
      SELECT * FROM history_data 
      WHERE station_id = ? 
      ORDER BY date DESC 
      LIMIT ?
    `).all(id, parseInt(days as string));

    res.json({
      success: true,
      data: history.map((h: any) => ({
        date: h.date,
        generation: h.generation,
        revenue: h.revenue,
        carbonReduction: h.carbon_reduction,
        peakHours: h.peak_hours,
      })).reverse(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取历史数据失败' });
  }
});

router.get('/:id/battery', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const battery: any = db.prepare('SELECT * FROM batteries WHERE station_id = ?').get(id);

    if (!battery) {
      res.status(404).json({ success: false, error: '电池信息不存在' });
      return;
    }

    res.json({
      success: true,
      data: {
        capacity: battery.capacity,
        currentCapacity: battery.current_capacity,
        soc: battery.soc,
        health: battery.health,
        temperature: battery.temperature,
        status: battery.status,
        chargeRate: battery.charge_rate,
        dischargeRate: battery.discharge_rate,
        cycleCount: battery.cycle_count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取电池信息失败' });
  }
});

router.get('/:id/strategy', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const strategy: any = db.prepare('SELECT * FROM charge_strategies WHERE station_id = ?').get(id);

    if (!strategy) {
      res.status(404).json({ success: false, error: '充放电策略不存在' });
      return;
    }

    res.json({
      success: true,
      data: {
        mode: strategy.mode,
        chargeStartTime: strategy.charge_start_time,
        chargeEndTime: strategy.charge_end_time,
        dischargeStartTime: strategy.discharge_start_time,
        dischargeEndTime: strategy.discharge_end_time,
        targetSoc: strategy.target_soc,
        minSoc: strategy.min_soc,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取充放电策略失败' });
  }
});

router.put('/:id/strategy', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { mode, chargeStartTime, chargeEndTime, dischargeStartTime, dischargeEndTime, targetSoc, minSoc } = req.body;

    db.prepare(`
      UPDATE charge_strategies 
      SET mode = ?, charge_start_time = ?, charge_end_time = ?, discharge_start_time = ?, discharge_end_time = ?, target_soc = ?, min_soc = ?
      WHERE station_id = ?
    `).run(mode, chargeStartTime, chargeEndTime, dischargeStartTime, dischargeEndTime, targetSoc, minSoc, id);

    res.json({ success: true, message: '充放电策略更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '更新充放电策略失败' });
  }
});

router.get('/:id/alarms', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { resolved } = req.query;

    let query = 'SELECT * FROM alarms WHERE station_id = ?';
    const params: any[] = [id];

    if (resolved !== undefined) {
      query += ' AND resolved = ?';
      params.push(resolved === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const alarms: any[] = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: alarms.map((a: any) => ({
        id: a.id,
        type: a.type,
        level: a.level,
        message: a.message,
        resolved: a.resolved === 1,
        resolvedAt: a.resolved_at,
        createdAt: a.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取告警信息失败' });
  }
});

export default router;
