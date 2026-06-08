import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/green_energy.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar TEXT,
      member_level TEXT NOT NULL DEFAULT 'silver',
      total_generation REAL NOT NULL DEFAULT 0,
      email TEXT,
      address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS power_stations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      capacity REAL NOT NULL,
      location TEXT,
      install_date TEXT,
      status TEXT NOT NULL DEFAULT 'normal',
      inverter_model TEXT,
      panel_count INTEGER DEFAULT 0,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS realtime_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      power REAL NOT NULL DEFAULT 0,
      daily_generation REAL NOT NULL DEFAULT 0,
      total_generation REAL NOT NULL DEFAULT 0,
      temperature REAL NOT NULL DEFAULT 25,
      inverter_status TEXT NOT NULL DEFAULT '正常运行',
      voltage REAL NOT NULL DEFAULT 220,
      current REAL NOT NULL DEFAULT 0,
      efficiency REAL NOT NULL DEFAULT 85,
      FOREIGN KEY (station_id) REFERENCES power_stations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS history_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id TEXT NOT NULL,
      date TEXT NOT NULL,
      generation REAL NOT NULL DEFAULT 0,
      revenue REAL NOT NULL DEFAULT 0,
      carbon_reduction REAL NOT NULL DEFAULT 0,
      peak_hours REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (station_id) REFERENCES power_stations(id) ON DELETE CASCADE,
      UNIQUE(station_id, date)
    );

    CREATE TABLE IF NOT EXISTS work_orders (
      id TEXT PRIMARY KEY,
      station_id TEXT NOT NULL,
      station_name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      assignee TEXT,
      assignee_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      escalated INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (station_id) REFERENCES power_stations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS work_order_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      time TEXT NOT NULL DEFAULT (datetime('now')),
      action TEXT NOT NULL,
      operator TEXT NOT NULL,
      remark TEXT,
      FOREIGN KEY (order_id) REFERENCES work_orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS batteries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id TEXT NOT NULL UNIQUE,
      capacity REAL NOT NULL DEFAULT 20,
      current_capacity REAL NOT NULL DEFAULT 14,
      soc REAL NOT NULL DEFAULT 70,
      health REAL NOT NULL DEFAULT 95,
      temperature REAL NOT NULL DEFAULT 25,
      status TEXT NOT NULL DEFAULT 'idle',
      charge_rate REAL NOT NULL DEFAULT 0,
      discharge_rate REAL NOT NULL DEFAULT 0,
      cycle_count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (station_id) REFERENCES power_stations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS charge_strategies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id TEXT NOT NULL UNIQUE,
      mode TEXT NOT NULL DEFAULT 'auto',
      charge_start_time TEXT,
      charge_end_time TEXT,
      discharge_start_time TEXT,
      discharge_end_time TEXT,
      target_soc REAL NOT NULL DEFAULT 90,
      min_soc REAL NOT NULL DEFAULT 20,
      FOREIGN KEY (station_id) REFERENCES power_stations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS price_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      price REAL NOT NULL,
      period TEXT NOT NULL,
      UNIQUE(date, time)
    );

    CREATE TABLE IF NOT EXISTS sell_orders (
      id TEXT PRIMARY KEY,
      station_id TEXT NOT NULL,
      station_name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      buyer TEXT,
      buyer_name TEXT,
      fee REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      matched_at TEXT,
      completed_at TEXT,
      FOREIGN KEY (station_id) REFERENCES power_stations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      seller_name TEXT NOT NULL,
      buyer_id TEXT NOT NULL,
      buyer_name TEXT NOT NULL,
      amount REAL NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      fee REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (order_id) REFERENCES sell_orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alarms (
      id TEXT PRIMARY KEY,
      station_id TEXT NOT NULL,
      station_name TEXT NOT NULL,
      type TEXT NOT NULL,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0,
      resolved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (station_id) REFERENCES power_stations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS grid_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      station_id TEXT NOT NULL,
      station_name TEXT NOT NULL,
      applicant_name TEXT NOT NULL,
      applicant_phone TEXT NOT NULL,
      applicant_id_card TEXT NOT NULL,
      address TEXT NOT NULL,
      station_capacity REAL NOT NULL,
      station_type TEXT NOT NULL,
      documents TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      review_remark TEXT,
      contract_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (station_id) REFERENCES power_stations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id TEXT NOT NULL,
      date TEXT NOT NULL,
      predicted_generation REAL NOT NULL,
      confidence REAL NOT NULL,
      weather TEXT,
      temperature REAL,
      suggestion TEXT,
      FOREIGN KEY (station_id) REFERENCES power_stations(id) ON DELETE CASCADE,
      UNIQUE(station_id, date)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_realtime_station ON realtime_data(station_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_history_station ON history_data(station_id, date DESC);
    CREATE INDEX IF NOT EXISTS idx_workorder_user ON work_orders(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_alarm_station ON alarms(station_id, resolved);
    CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications(user_id, read);
  `);

  console.log('Database initialized successfully');
}

export default db;
