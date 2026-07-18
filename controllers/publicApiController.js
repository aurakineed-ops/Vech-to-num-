const axios = require('axios');
const ApiKey = require('../models/ApiKey');
const RequestLog = require('../models/RequestLog');
const Settings = require('../models/Settings');
const { lookupCountry } = require('../utils/geoLookup');

exports.fetchVehicle = async (req, res) => {
  const vehicleNumber = req.query.vehicle || req.params.number;
  const record = req.apiKeyRecord;
  const { ip, userAgent, startedAt } = req.requestMeta;

  if (!vehicleNumber) {
    return res.status(400).json({ success: false, message: 'vehicle query parameter is required' });
  }

  const settings = Settings.get();
  const baseUrl = settings.api_base_url || process.env.VEHICLE_API_BASE_URL;

  let status = 200;
  let payload;

  try {
    const upstream = await axios.get(`${baseUrl}${encodeURIComponent(vehicleNumber)}`, { timeout: 10000 });
    payload = upstream.data;
    status = upstream.status;
  } catch (err) {
    status = err.response?.status || 502;
    payload = { success: false, message: 'Upstream Vehicle Info API error', detail: err.message };
  }

  ApiKey.registerUsage(record.id);
  lookupCountry(ip).then((country) => {
    RequestLog.create({
      apiKey: record.key,
      owner: record.owner_name,
      vehicleNumber,
      ip,
      country,
      userAgent,
      status,
      responseTime: Date.now() - startedAt
    });
  });

  return res.status(status).json(payload);
};
