const RequestLog = require('../models/RequestLog');
const ApiKey = require('../models/ApiKey');
const { logsToCSV } = require('../utils/csvExport');

exports.list = (req, res) => {
  const { q = '', apiKey = '', status = '', from = '', to = '', page = 1 } = req.query;
  const result = RequestLog.search({ q, apiKey, status, from, to, page: Number(page), pageSize: 25 });
  const allKeys = ApiKey.getAll();

  res.render('logs', {
    title: 'Request Logs',
    active: 'logs',
    logs: result.rows,
    pagination: result,
    filters: { q, apiKey, status, from, to },
    allKeys,
    success: req.flash('success'),
    error: req.flash('error')
  });
};

exports.remove = (req, res) => {
  RequestLog.delete(req.params.id);
  req.flash('success', 'Log entry deleted.');
  res.redirect('back');
};

exports.bulkDelete = (req, res) => {
  const ids = [].concat(req.body.ids || []);
  if (ids.length) RequestLog.deleteMany(ids);
  req.flash('success', `${ids.length} log(s) deleted.`);
  res.redirect('back');
};

exports.clearAll = (req, res) => {
  RequestLog.clearAll();
  req.flash('success', 'All logs cleared.');
  res.redirect('/logs');
};

exports.exportCSV = (req, res) => {
  const { q = '' } = req.query;
  const rows = RequestLog.all({ q });
  const csv = logsToCSV(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment(`request_logs_${Date.now()}.csv`);
  res.send(csv);
};
