const ApiKey = require('../models/ApiKey');
const RequestLog = require('../models/RequestLog');
const { lookupCountry } = require('../utils/geoLookup');

async function apiKeyAuth(req, res, next) {
  const startedAt = Date.now();
  const key = req.header('x-api-key');
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || 'unknown';

  const logFailure = async (status, message, ownerName = 'unknown') => {
    const country = await lookupCountry(ip);
    RequestLog.create({
      apiKey: key || 'MISSING',
      owner: ownerName,
      vehicleNumber: req.query.vehicle || req.params.number || '',
      ip,
      country,
      userAgent,
      status,
      responseTime: Date.now() - startedAt
    });
    return res.status(status).json({ success: false, message });
  };

  if (!key) {
    return logFailure(401, 'API Key is required');
  }

  const record = ApiKey.findByKey(key);
  if (!record) {
    return logFailure(401, 'Invalid API Key');
  }

  // Lazy auto-expiry check
  if (ApiKey.isExpired(record) && record.status === 'enabled') {
    ApiKey.setStatus(record.id, 'disabled');
    record.status = 'disabled';
  }
  if (ApiKey.isExpired(record)) {
    return logFailure(403, 'API Key Expired', record.owner_name);
  }

  if (record.status !== 'enabled') {
    return logFailure(403, 'API Key Disabled', record.owner_name);
  }

  if (record.request_count >= record.total_limit) {
    return logFailure(429, 'Total request limit reached for this API Key', record.owner_name);
  }

  const isNewDay = record.today_date !== new Date().toISOString().slice(0, 10);
  const todaysCount = isNewDay ? 0 : record.today_requests;
  if (todaysCount >= record.daily_limit) {
    return logFailure(429, 'Daily request limit reached for this API Key', record.owner_name);
  }

  req.apiKeyRecord = record;
  req.requestMeta = { ip, userAgent, startedAt };
  next();
}

module.exports = apiKeyAuth;
