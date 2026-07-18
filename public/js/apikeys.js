/**
 * public/js/apikeys.js
 * Client-side search/sort helper for the API keys table (no server round-trip).
 */
document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('keysTable');
  if (!table) return;

  // Simple column sort on header click
  table.querySelectorAll('thead th').forEach((th, index) => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const rows = Array.from(table.querySelectorAll('tbody tr')).filter(r => !r.classList.contains('modal'));
      const dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
      th.dataset.dir = dir;
      rows.sort((a, b) => {
        const av = a.children[index]?.innerText.trim() || '';
        const bv = b.children[index]?.innerText.trim() || '';
        const an = parseFloat(av), bn = parseFloat(bv);
        const cmp = (!isNaN(an) && !isNaN(bn)) ? an - bn : av.localeCompare(bv);
        return dir === 'asc' ? cmp : -cmp;
      });
      const tbody = table.querySelector('tbody');
      rows.forEach(r => tbody.appendChild(r));
    });
  });
});
