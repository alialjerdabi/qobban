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

  /* ------------------------------------------------------------------
     Page transition direction — the site as a spatial map.

     Top-level pages sit on one horizontal line in nav order, so Quote is
     always at the far right and Home at the far left. Move to a page
     further along and the content slides that way; move back and it
     slides the other way. That fixed geography is what stops navigation
     feeling like an endless loop: the motion tells you where you are.

     Service pages sit one level *beneath* Services, so entering one moves
     forward in depth rather than sideways, and leaving reverses it.

     Because direction is derived from the two URLs, browser back/forward
     is handled for free — no need to inspect the navigation type.
     ------------------------------------------------------------------ */
  var ORDER = ['index.html', 'services.html', 'projects.html',
    'process.html', 'about.html', 'contact.html', 'quote.html'];
  var SERVICES = ['gates.html', 'pergolas.html', 'railings.html',
    'canopies.html', 'custom-fabrication.html', 'maintenance.html'];

  function locate(url) {
    var path;
    try { path = new URL(url, location.href).pathname; } catch (e) { return null; }
    var file = path.split('/').pop() || 'index.html';
    if (path.indexOf('/services/') > -1) {
      // Child of Services: same lateral slot, one level deeper.
      return { x: ORDER.indexOf('services.html'), depth: 1, sub: SERVICES.indexOf(file) };
    }
    var x = ORDER.indexOf(file);
    return { x: x < 0 ? 0 : x, depth: 0, sub: -1 };
  }

  function direction(fromUrl, toUrl) {
    var a = locate(fromUrl), b = locate(toUrl);
    if (!a || !b) return 'forward';
    if (b.depth > a.depth) return 'in';       // drilling into a service
    if (b.depth < a.depth) return 'out';      // stepping back up
    var i = a.depth ? a.sub : a.x;            // siblings compare laterally
    var j = b.depth ? b.sub : b.x;
    if (j === i) return 'forward';
    return j > i ? 'forward' : 'back';
  }

  /* Outgoing document: the destination is on the activation entry. */
  window.addEventListener('pageswap', function (e) {
    if (!e.viewTransition || !e.activation || !e.activation.entry) return;
    root.dataset.nav = direction(location.href, e.activation.entry.url);
  });

  /* Incoming document: `from` is where we just came from. */
  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    var act = window.navigation && window.navigation.activation;
    var from = act && act.from && act.from.url;
    root.dataset.nav = from ? direction(from, location.href) : 'forward';
  });
})();
