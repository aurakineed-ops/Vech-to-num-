const ApiKey = require('../models/ApiKey');
const RequestLog = require('../models/RequestLog');
const Admin = require('../models/Admin');
const db = require('../config/db');

function buildStats() {
  ApiKey.sweepExpired(); // ensure expired keys are reflected before counting

  const keyStats = ApiKey.stats();
  const logCounts = RequestLog.counts();
  const totalUsers = Admin.count();

  return {
    totalRequests: logCounts.total,
    todayRequests: logCounts.today,
    monthRequests: logCounts.month,
    totalApiKeys: keyStats.total,
    activeApiKeys: keyStats.active,
    expiredApiKeys: keyStats.expired,
    disabledApiKeys: keyStats.disabled,
    totalUsers,
    successRequests: logCounts.success,
    failedRequests: logCounts.failed,
    avgResponseTime: logCounts.avgResponseTime,
    serverStatus: 'Online',
    apiStatus: 'Operational'
  };
}

exports.showDashboard = (req, res) => {
  const stats = buildStats();
  const daily = RequestLog.dailySeries(14);
  const monthly = RequestLog.monthlySeries(6);
  const topKeys = ApiKey.topUsed(5);

  res.render('dashboard', {
    title: 'Dashboard',
    active: 'dashboard',
    stats,
    daily: JSON.stringify(daily),
    monthly: JSON.stringify(monthly),
    topKeys: JSON.stringify(topKeys),
    activeVsExpired: JSON.stringify([
      { label: 'Active', value: stats.activeApiKeys },
      { label: 'Expired', value: stats.expiredApiKeys },
      { label: 'Disabled', value: stats.disabledApiKeys }
    ]),
    successVsFailed: JSON.stringify([
      { label: 'Success', value: stats.successRequests },
      { label: 'Failed', value: stats.failedRequests }
    ])
  });
};

exports.liveStats = (req, res) => {
  res.json(buildStats());
};
