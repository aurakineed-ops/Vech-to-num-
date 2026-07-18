const axios = require('axios');

const cache = new Map();

async function lookupCountry(ip) {
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'Local';
  }
  if (cache.has(ip)) return cache.get(ip);

  try {
    const { data } = await axios.get(`https://ipapi.co/${ip}/country_name/`, { timeout: 1500 });
    const country = (typeof data === 'string' && data.trim()) ? data.trim() : 'Unknown';
    cache.set(ip, country);
    return country;
  } catch (err) {
    return 'Unknown';
  }
}

module.exports = { lookupCountry };
