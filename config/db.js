const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './data/database.sqlite';

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      owner_name TEXT NOT NULL,
      daily_limit INTEGER DEFAULT 100,
      total_limit INTEGER DEFAULT 10000,
      request_count INTEGER DEFAULT 0,
      today_requests INTEGER DEFAULT 0,
      today_date TEXT,
      status TEXT DEFAULT 'enabled',
      created_at TEXT DEFAULT (datetime('now')),
      expiry_days INTEGER DEFAULT 30,
      expiry_date TEXT NOT NULL,
      last_used TEXT
    );

    CREATE TABLE IF NOT EXISTS request_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key TEXT,
      owner TEXT,
      vehicle_number TEXT,
      ip_address TEXT,
      country TEXT,
      user_agent TEXT,
      response_status INTEGER,
      response_time INTEGER,
      timestamp TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      website_name TEXT DEFAULT 'Vehicle Info Admin',
      logo TEXT DEFAULT '/img/logo.png',
      theme TEXT DEFAULT 'light',
      maintenance_mode INTEGER DEFAULT 0,
      api_base_url TEXT DEFAULT 'https://vehicleinfo.noobgamingv40.workers.dev/fetch?vehicle=',
      default_daily_limit INTEGER DEFAULT 100,
      default_total_limit INTEGER DEFAULT 10000
    );

    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON request_logs (timestamp);
    CREATE INDEX IF NOT EXISTS idx_logs_apikey ON request_logs (api_key);
    CREATE INDEX IF NOT EXISTS idx_apikeys_status ON api_keys (status);
  `);

  const settingsRow = db.prepare('SELECT id FROM settings WHERE id = 1').get();
  if (!settingsRow) {
    db.prepare(`
      INSERT INTO settings (id, website_name, logo, theme, maintenance_mode, api_base_url, default_daily_limit, default_total_limit)
      VALUES (1, 'Vehicle Info Admin', '/img/logo.png', 'light', 0, ?, ?, ?)
    `).run(
      process.env.VEHICLE_API_BASE_URL || 'https://vehicleinfo.noobgamingv40.workers.dev/fetch?vehicle=',
      Number(process.env.DEFAULT_DAILY_LIMIT || 100),
      Number(process.env.DEFAULT_TOTAL_LIMIT || 10000)
    );
  }

  const adminCount = db.prepare('SELECT COUNT(*) AS c FROM admins').get().c;
  if (adminCount === 0) {
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'superadmin';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'aura@1234';
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(`
      INSERT INTO admins (username, password_hash, role) VALUES (?, ?, 'superadmin')
    `).run(username, hash);
    console.log(`✔ Default admin created -> username: ${username}`);
  }
}

initSchema();

module.exports = db;
