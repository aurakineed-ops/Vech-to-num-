require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const expressLayouts = require('express-ejs-layouts');
const cron = require('node-cron');

require('./config/db'); // initializes schema + seeds default admin
const ApiKey = require('./models/ApiKey');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const logRoutes = require('./routes/logRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const publicApiRoutes = require('./routes/publicApiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------------------- View Engine ---------------------------- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'partials/layout');

/* ------------------------------ Security ------------------------------ */
app.use(helmet({
  contentSecurityPolicy: false // relaxed for CDN-hosted Bootstrap/Chart.js in views
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limit the public API surface to deter abuse
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, slow down.' }
});
app.use('/api/', apiLimiter);

/* ------------------------------ Parsers -------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'insecure_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));
app.use(flash());

/* ------------------------------ Static --------------------------------- */
app.use(express.static(path.join(__dirname, 'public')));

/* --------------------------- Locals for views --------------------------- */
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

/* -------------------------------- Routes -------------------------------- */
app.get('/', (req, res) => res.redirect('/dashboard'));

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(apiKeyRoutes);
app.use(logRoutes);
app.use(analyticsRoutes);
app.use(settingsRoutes);

// Public JSON API (this is what your end-users integrate with)
app.use('/api/v1', publicApiRoutes);

/* --------------------------- Auto Expiry Cron --------------------------- */
cron.schedule('*/15 * * * *', () => {
  const changed = ApiKey.sweepExpired();
  if (changed > 0) console.log(`⏱  Auto-expiry: disabled ${changed} expired key(s).`);
});

/* -------------------------------- Errors --------------------------------- */
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Vehicle Info Admin Panel running on http://localhost:${PORT}`);
});
