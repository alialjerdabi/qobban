/* Runs before first paint: repeat visitors skip the loading screen entirely.
   Kept as a file rather than an inline script so the CSP can refuse
   inline JavaScript outright. Must stay render-blocking — deferring it
   would show a flash of the loader before it could be removed. */
try {
  if (sessionStorage.getItem('qobban-loaded')) {
    document.documentElement.className += ' is-loaded';
  }
} catch (e) {}
