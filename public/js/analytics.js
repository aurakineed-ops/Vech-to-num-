/**
 * public/js/analytics.js
 * Charts for the Analytics page (30-day daily + 12-month trend).
 */
(function () {
  const data = window.__ANALYTICS_DATA__ || {};

  new Chart(document.getElementById('analyticsDailyChart'), {
    type: 'line',
    data: {
      labels: data.daily.map(d => d.day),
      datasets: [{
        label: 'Requests', data: data.daily.map(d => d.count),
        borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.15)', tension: .35, fill: true
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  new Chart(document.getElementById('analyticsMonthlyChart'), {
    type: 'bar',
    data: {
      labels: data.monthly.map(m => m.month),
      datasets: [{ label: 'Requests', data: data.monthly.map(m => m.count), backgroundColor: '#0d9488', borderRadius: 6 }]
    },
    options: { plugins: { legend: { display: false } } }
  });
})();
