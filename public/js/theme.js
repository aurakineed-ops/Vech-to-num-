/**
 * public/js/theme.js
 * Dark / Light mode toggle, persisted in localStorage.
 */
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('vi-theme') || 'light';
  root.setAttribute('data-bs-theme', saved);

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    updateIcon(saved);
    if (btn) {
      btn.addEventListener('click', () => {
        const current = root.getAttribute('data-bs-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-bs-theme', next);
        localStorage.setItem('vi-theme', next);
        updateIcon(next);
      });
    }
  });

  function updateIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.innerHTML = theme === 'dark'
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-stars-fill"></i>';
  }
})();
