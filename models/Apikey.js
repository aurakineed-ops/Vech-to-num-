const db = require('../config/db');

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + Number(days));
  return d.toISOString();
}

const ApiKey = {
  getAll() {
    return db.prepare('SELECT * FROM api_keys ORDER BY id DESC').all();
  },

  findByKey(key) {
    return db.prepare('SELECT * FROM api_keys WHERE key = ?').get(key);
  },

  findById(id) {
    return db.prepare('SELECT * FROM api_keys WHERE id = ?').get(id);
  },

  create({ key, ownerName, dailyLimit, totalLimit, expiryDays }) {
    const expiryDate = addDays(expiryDays);
    const stmt = db.prepare(`
      INSERT INTO api_keys (key, owner_name, daily_limit, total_limit, request_count, today_requests, today_date, status, expiry_days, expiry_date)
      VALUES (?, ?, ?, ?, 0, 0, ?, 'enabled', ?, ?)
    `);
    const info = stmt.run(key, ownerName, dailyLimit, totalLimit, todayStr(), expiryDays, expiryDate);
    return info.lastInsertRowid;
  },

  update(id, { ownerName, dailyLimit, totalLimit }) {
    db.prepare(`
      UPDATE api_keys SET owner_name = ?, daily_limit = ?, total_limit = ? WHERE id = ?
    `).run(ownerName, dailyLimit, totalLimit, id);
  },

  setStatus(id, status) {
    db.prepare('UPDATE api_keys SET status = ? WHERE id = ?').run(status, id);
  },

  delete(id) {
    db.prepare('DELETE FROM api_keys WHERE id = ?').run(id);
  },

  resetUsage(id) {
    db.prepare(`
      UPDATE api_keys SET request_count = 0, today_requests = 0, today_date = ? WHERE id = ?
    `).run(todayStr(), id);
  },

  extendExpiry(id, extraDays) {
    const key = ApiKey.findById(id);
    if (!key) return;
    const base = new Date(key.expiry_date) > new Date() ? new Date(key.expiry_date) : new Date();
    base.setDate(base.getDate() + Number(extraDays));
    db.prepare('UPDATE api_keys SET expiry_date = ?, expiry_days = expiry_days + ? WHERE id = ?')
      .run(base.toISOString(), extraDays, id);
    if (key.status === 'disabled' && base > new Date()) {
      db.prepare("UPDATE api_keys SET status = 'enabled' WHERE id = ?").run(id);
    }
  },

  registerUsage(id) {
    const key = ApiKey.findById(id);
    if (!key) return;
    const isNewDay = key.today_date !== todayStr();
    db.prepare(`
      UPDATE api_keys
      SET request_count = request_count + 1,
          today_requests = ?,
          today_date = ?,
          last_used = datetime('now')
      WHERE id = ?
    `).run(isNewDay ? 1 : key.today_requests + 1, todayStr(), id);
  },

  sweepExpired() {
    const now = new Date().toISOString();
    const result = db.prepare(`
      UPDATE api_keys SET status = 'disabled'
      WHERE status = 'enabled' AND expiry_date < ?
    `).run(now);
    return result.changes;
  },

  isExpired(key) {
    return new Date(key.expiry_date) < new Date();
  },

  stats() {
    const total = db.prepare('SELECT COUNT(*) AS c FROM api_keys').get().c;
    const active = db.prepare("SELECT COUNT(*) AS c FROM api_keys WHERE status = 'enabled' AND expiry_date >= datetime('now')").get().c;
    const expired = db.prepare("SELECT COUNT(*) AS c FROM api_keys WHERE expiry_date < datetime('now')").get().c;
    const disabled = db.prepare("SELECT COUNT(*) AS c FROM api_keys WHERE status = 'disabled' AND expiry_date >= datetime('now')").get().c;
    return { total, active, expired, disabled };
  },

  topUsed(limit = 5) {
    return db.prepare('SELECT owner_name, key, request_count FROM api_keys ORDER BY request_count DESC LIMIT ?').all(limit);
  }
};

module.exports = ApiKey;
