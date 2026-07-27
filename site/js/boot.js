/* Runs before first paint. Restores theme, language and the loader-skip flag
   so none of them flash. Kept as a file rather than an inline script so the
   CSP can refuse inline JavaScript outright. Must stay render-blocking. */
(function () {
  var root = document.documentElement;
  var get = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };

  /* Theme: explicit choice wins, otherwise follow the OS. The site is
     dark-first, so an unknown preference resolves to dark. */
  var theme = get('qobban-theme');
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  root.setAttribute('data-theme', theme);

  /* Language: only 'ar' changes anything; 'en' is the document default. */
  if (get('qobban-lang') === 'ar') {
    root.lang = 'ar';
    root.dir = 'rtl';
  }

  try {
    if (sessionStorage.getItem('qobban-loaded')) root.className += ' is-loaded';
  } catch (e) {}
})();
