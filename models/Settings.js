const db = require('../config/db');

const Settings = {
  get() {
    return db.prepare('SELECT * FROM settings WHERE id = 1').get();
  },

  update({ websiteName, logo, theme, maintenanceMode, apiBaseUrl, defaultDailyLimit, defaultTotalLimit }) {
    const current = Settings.get();
    db.prepare(`
      UPDATE settings SET
        website_name = ?,
        logo = ?,
        theme = ?,
        maintenance_mode = ?,
        api_base_url = ?,
        default_daily_limit = ?,
        default_total_limit = ?
      WHERE id = 1
    `).run(
      websiteName ?? current.website_name,
      logo ?? current.logo,
      theme ?? current.theme,
      maintenanceMode !== undefined ? (maintenanceMode ? 1 : 0) : current.maintenance_mode,
      apiBaseUrl ?? current.api_base_url,
      defaultDailyLimit ?? current.default_daily_limit,
      defaultTotalLimit ?? current.default_total_limit
    );
    return Settings.get();
  }
};

module.exports = Settings;
