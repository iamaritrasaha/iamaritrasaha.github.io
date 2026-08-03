// Theme toggle script
(() => {
  const toggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;
  const storageKey = 'preferred-theme';

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }
    localStorage.setItem(storageKey, theme);
  };

  const initTheme = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      applyTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  };

  toggle.addEventListener('click', () => {
    const isDark = htmlEl.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  });

  initTheme();
})();
