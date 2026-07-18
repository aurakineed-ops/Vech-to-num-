const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { JWT_SECRET } = require('../middleware/auth');

exports.showLogin = (req, res) => {
  res.render('login', { title: 'Admin Login', layout: false, error: req.flash('error') });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.flash('error', 'Username and password are required.');
    return res.redirect('/login');
  }

  const admin = Admin.findByUsername(username.trim());
  if (!admin) {
    req.flash('error', 'Invalid username or password.');
    return res.redirect('/login');
  }

  const match = await bcrypt.compare(password, admin.password_hash);
  if (!match) {
    req.flash('error', 'Invalid username or password.');
    return res.redirect('/login');
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  Admin.updateLastLogin(admin.id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.redirect('/dashboard');
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const admin = Admin.findById(req.admin.id);

  const match = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!match) {
    req.flash('error', 'Current password is incorrect.');
    return res.redirect('/settings');
  }
  if (newPassword !== confirmPassword) {
    req.flash('error', 'New password and confirmation do not match.');
    return res.redirect('/settings');
  }
  if (newPassword.length < 6) {
    req.flash('error', 'New password must be at least 6 characters.');
    return res.redirect('/settings');
  }

  const hash = await bcrypt.hash(newPassword, 10);
  Admin.updatePassword(admin.id, hash);
  req.flash('success', 'Password updated successfully.');
  res.redirect('/settings');
};
