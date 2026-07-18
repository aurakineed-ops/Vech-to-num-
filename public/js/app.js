/**
 * public/js/app.js
 * Global UI behaviors: sidebar toggle (mobile), auto-dismiss toasts, copy-to-clipboard.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Mobile sidebar toggle
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => sidebar.classList.toggle('show'));
  }

  // Auto-dismiss toast notifications
  document.querySelectorAll('[data-autotoast]').forEach((el, i) => {
    el.style.top = `${1 + i * 3.2}rem`;
    setTimeout(() => {
      el.style.transition = 'opacity .3s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3500);
  });

  // Copy-to-clipboard for API keys
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(() => {
        const icon = btn.querySelector('i');
        icon.className = 'bi bi-check-lg text-success';
        setTimeout(() => { icon.className = 'bi bi-clipboard'; }, 1200);
      });
    });
  });
});
