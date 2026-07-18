const Settings = require('../models/Settings');

function maintenanceGuard(req, res, next) {
  const settings = Settings.get();
  if (settings.maintenance_mode) {
    return res.status(503).json({ success: false, message: 'API is currently under maintenance. Please try again later.' });
  }
  next();
}

module.exports = maintenanceGuard;
