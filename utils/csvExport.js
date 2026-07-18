const { Parser } = require('json2csv');

function logsToCSV(rows) {
  const fields = [
    { label: 'ID', value: 'id' },
    { label: 'API Key', value: 'api_key' },
    { label: 'Owner', value: 'owner' },
    { label: 'Vehicle Number', value: 'vehicle_number' },
    { label: 'IP Address', value: 'ip_address' },
    { label: 'Country', value: 'country' },
    { label: 'User Agent', value: 'user_agent' },
    { label: 'Response Status', value: 'response_status' },
    { label: 'Response Time (ms)', value: 'response_time' },
    { label: 'Timestamp', value: 'timestamp' }
  ];
  const parser = new Parser({ fields });
  return parser.parse(rows);
}

module.exports = { logsToCSV };
