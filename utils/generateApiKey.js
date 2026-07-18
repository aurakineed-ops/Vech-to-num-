const crypto = require('crypto');

function generateApiKey(customKey) {
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  const random = crypto.randomBytes(24).toString('hex');
  return `vik_live_${random}`;
}

module.exports = generateApiKey;
