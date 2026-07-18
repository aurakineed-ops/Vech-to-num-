/**
 * public/js/dashboard.js
 * Renders all Chart.js visualizations for the dashboard and polls
 * /dashboard/live every 10s to keep the stat cards fresh (Realtime Dashboard).
 */
(function () {
  const data = window.__DASHBOARD_DATA__ || {};
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
  const textColor = isDark ? '#c7ccdc' : '#4a5064';
  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = gridColor;

  // Daily requests (line)
  new Chart(document.getElementById('dailyChart'), {
    type: 'line',
    data: {
      labels: data.daily.map(d => d.day),
      datasets: [{
        label: 'Requests',
        data: data.daily.map(d => d.count),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,.15)',
        tension: .35,
        fill: true
      }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  // Monthly requests (bar)
  new Chart(document.getElementById('monthlyChart'), {
    type: 'bar',
    data: {
      labels: data.monthly.map(m => m.month),
      datasets: [{ label: 'Requests', data: data.monthly.map(m => m.count), backgroundColor: '#0d9488', borderRadius: 6 }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  // Top used API keys (horizontal bar)
  new Chart(document.getElementById('topKeysChart'), {
    type: 'bar',
    data: {
      labels: data.topKeys.map(k => k.owner_name),
      datasets: [{ label: 'Requests', data: data.topKeys.map(k => k.request_count), backgroundColor: '#7c3aed', borderRadius: 6 }]
    },
    options: { indexAxis: 'y', plugins: { legend: { display: false } } }
  });

  // Success vs Failed (doughnut)
  new Chart(document.getElementById('successChart'), {
    type: 'doughnut',
    data: {
      labels: data.successVsFailed.map(d => d.label),
      datasets: [{ data: data.successVsFailed.map(d => d.value), backgroundColor: ['#16a34a', '#dc2626'] }]
    }
  });

  // Active vs Expired vs Disabled (pie)
  new Chart(document.getElementById('keyStatusChart'), {
    type: 'pie',
    data: {
      labels: data.activeVsExpired.map(d => d.label),
      datasets: [{ data: data.activeVsExpired.map(d => d.value), backgroundColor: ['#16a34a', '#f59e0b', '#6b7280'] }]
    }
  });

  // Live stat polling (Realtime Dashboard)
  async function refreshLiveStats() {
    try {
      const res = await fetch('/dashboard/live');
      if (!res.ok) return;
      const s = await res.json();
      setText('statTotalRequests', s.totalRequests);
      setText('statTodayRequests', s.todayRequests);
      setText('statMonthRequests', s.monthRequests);
    } catch (e) { /* silent fail keeps dashboard usable offline */ }
  }
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  setInterval(refreshLiveStats, 10000);
})();
