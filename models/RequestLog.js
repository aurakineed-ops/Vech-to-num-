const db = require('../config/db');

const RequestLog = {
  create({ apiKey, owner, vehicleNumber, ip, country, userAgent, status, responseTime }) {
    db.prepare(`
      INSERT INTO request_logs (api_key, owner, vehicle_number, ip_address, country, user_agent, response_status, response_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(apiKey, owner, vehicleNumber, ip, country || 'Unknown', userAgent, status, responseTime);
  },

  search({ q, apiKey, status, from, to, page = 1, pageSize = 25 }) {
    const clauses = [];
    const params = [];

    if (q) {
      clauses.push('(vehicle_number LIKE ? OR owner LIKE ? OR ip_address LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (apiKey) {
      clauses.push('api_key = ?');
      params.push(apiKey);
    }
    if (status) {
      clauses.push('response_status = ?');
      params.push(status);
    }
    if (from) {
      clauses.push('timestamp >= ?');
      params.push(from);
    }
    if (to) {
      clauses.push('timestamp <= ?');
      params.push(to);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const total = db.prepare(`SELECT COUNT(*) AS c FROM request_logs ${where}`).get(...params).c;
    const offset = (page - 1) * pageSize;
    const rows = db.prepare(`
      SELECT * FROM request_logs ${where} ORDER BY id DESC LIMIT ? OFFSET ?
    `).all(...params, pageSize, offset);

    return { rows, total, page: Number(page), pageSize: Number(pageSize), pages: Math.ceil(total / pageSize) || 1 };
  },

  all(filters = {}) {
    const clauses = [];
    const params = [];
    if (filters.q) {
      clauses.push('(vehicle_number LIKE ? OR owner LIKE ? OR ip_address LIKE ?)');
      params.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    return db.prepare(`SELECT * FROM request_logs ${where} ORDER BY id DESC LIMIT 50000`).all(...params);
  },

  delete(id) {
    db.prepare('DELETE FROM request_logs WHERE id = ?').run(id);
  },

  deleteMany(ids) {
    const stmt = db.prepare('DELETE FROM request_logs WHERE id = ?');
    const tx = db.transaction((list) => list.forEach((id) => stmt.run(id)));
    tx(ids);
  },

  clearAll() {
    db.prepare('DELETE FROM request_logs').run();
  },

  counts() {
    const total = db.prepare('SELECT COUNT(*) AS c FROM request_logs').get().c;
    const today = db.prepare("SELECT COUNT(*) AS c FROM request_logs WHERE date(timestamp) = date('now')").get().c;
    const month = db.prepare("SELECT COUNT(*) AS c FROM request_logs WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now')").get().c;
    const success = db.prepare("SELECT COUNT(*) AS c FROM request_logs WHERE response_status BETWEEN 200 AND 299").get().c;
    const failed = db.prepare("SELECT COUNT(*) AS c FROM request_logs WHERE response_status NOT BETWEEN 200 AND 299").get().c;
    const avgResponseTime = db.prepare("SELECT AVG(response_time) AS a FROM request_logs").get().a || 0;
    return { total, today, month, success, failed, avgResponseTime: Math.round(avgResponseTime) };
  },

  dailySeries(days = 14) {
    return db.prepare(`
      SELECT date(timestamp) AS day, COUNT(*) AS count
      FROM request_logs
      WHERE timestamp >= datetime('now', ?)
      GROUP BY day ORDER BY day ASC
    `).all(`-${days} days`);
  },

  monthlySeries(months = 6) {
    return db.prepare(`
      SELECT strftime('%Y-%m', timestamp) AS month, COUNT(*) AS count
      FROM request_logs
      WHERE timestamp >= datetime('now', ?)
      GROUP BY month ORDER BY month ASC
    `).all(`-${months} months`);
  },

  topVehicles(limit = 10) {
    return db.prepare(`
      SELECT vehicle_number, COUNT(*) AS count
      FROM request_logs
      GROUP BY vehicle_number ORDER BY count DESC LIMIT ?
    `).all(limit);
  },

  topOwners(limit = 10) {
    return db.prepare(`
      SELECT owner, COUNT(*) AS count
      FROM request_logs
      GROUP BY owner ORDER BY count DESC LIMIT ?
    `).all(limit);
  }
};

module.exports = RequestLog;
