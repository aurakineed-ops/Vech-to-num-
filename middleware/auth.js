const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'insecure_dev_secret_change_me';

function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded; // { id, username, role }
    res.locals.currentAdmin = decoded;
    return next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
}

function redirectIfAuthed(req, res, next) {
  const token = req.cookies?.token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (err) {
      // token invalid/expired, fall through to login page
    }
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (req.admin?.role !== 'superadmin') {
    req.flash('error', 'Only super admins can perform this action.');
    return res.redirect('back');
  }
  next();
}

module.exports = { requireAuth, redirectIfAuthed, requireSuperAdmin, JWT_SECRET };
