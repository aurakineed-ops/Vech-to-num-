const Settings = require('../models/Settings');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

exports.show = (req, res) => {
  const settings = Settings.get();
  const admins = Admin.getAll();
  res.render('settings', {
    title: 'Settings',
    active: 'settings',
    settings,
    admins,
    success: req.flash('success'),
    error: req.flash('error')
  });
};

exports.update = (req, res) => {
  const { websiteName, logo, theme, maintenanceMode, apiBaseUrl, defaultDailyLimit, defaultTotalLimit } = req.body;
  Settings.update({
    websiteName,
    logo,
    theme,
    maintenanceMode: maintenanceMode === 'on',
    apiBaseUrl,
    defaultDailyLimit: Number(defaultDailyLimit),
    defaultTotalLimit: Number(defaultTotalLimit)
  });
  req.flash('success', 'Settings updated successfully.');
  res.redirect('/settings');
};

exports.createAdmin = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    req.flash('error', 'Username and password are required.');
    return res.redirect('/settings');
  }
  if (Admin.findByUsername(username.trim())) {
    req.flash('error', 'That username already exists.');
    return res.redirect('/settings');
  }
  const hash = await bcrypt.hash(password, 10);
  Admin.create({ username: username.trim(), passwordHash: hash, role: role === 'superadmin' ? 'superadmin' : 'admin' });
  req.flash('success', `Admin "${username}" created.`);
  res.redirect('/settings');
};

exports.deleteAdmin = (req, res) => {
  const { id } = req.params;
  if (Number(id) === req.admin.id) {
    req.flash('error', 'You cannot delete your own account while logged in.');
    return res.redirect('/settings');
  }
  if (Admin.count() <= 1) {
    req.flash('error', 'At least one admin account must remain.');
    return res.redirect('/settings');
  }
  Admin.delete(id);
  req.flash('success', 'Admin account deleted.');
  res.redirect('/settings');
};
