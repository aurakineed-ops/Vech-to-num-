const db = require('../config/db');

const Admin = {
  findByUsername(username) {
    return db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  },

  findById(id) {
    return db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
  },

  getAll() {
    return db.prepare('SELECT id, username, role, created_at, last_login FROM admins ORDER BY id ASC').all();
  },

  create({ username, passwordHash, role = 'admin' }) {
    const stmt = db.prepare('INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)');
    const info = stmt.run(username, passwordHash, role);
    return info.lastInsertRowid;
  },

  updatePassword(id, passwordHash) {
    db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(passwordHash, id);
  },

  updateLastLogin(id) {
    db.prepare("UPDATE admins SET last_login = datetime('now') WHERE id = ?").run(id);
  },

  delete(id) {
    db.prepare('DELETE FROM admins WHERE id = ?').run(id);
  },

  count() {
    return db.prepare('SELECT COUNT(*) AS c FROM admins').get().c;
  }
};

module.exports = Admin;
