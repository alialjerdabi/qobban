/* ============================================================
   QOBBAN — site behaviour
   Vanilla JS, no dependencies. All motion respects
   prefers-reduced-motion. i18n scaffold is RTL-ready.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     LOADING SCREEN — first visit per session only.
     Dismisses as soon as assets are ready; the cap is a safety
     net, not a minimum. Never delays the Home → Quote path.
     ============================================================ */
  var loader = document.querySelector('[data-loader]');
  if (loader) {
    var MIN_SHOW = reduced ? 0 : 700;   /* let the bubble settle, don't flash */
    var MAX_SHOW = reduced ? 0 : 1200;  /* hard cap — never hold the page hostage */
    var began = performance.now();
    var dismissed = false;

    var dismiss = function () {
      if (dismissed) return;
      dismissed = true;
      loader.classList.add('is-done');
      document.documentElement.classList.add('is-loaded');
      try { sessionStorage.setItem('qobban-loaded', '1'); } catch (e) {}
      setTimeout(function () { loader.remove(); }, 1000);
    };

    var readyToDismiss = function () {
      var elapsed = performance.now() - began;
      setTimeout(dismiss, Math.max(0, MIN_SHOW - elapsed));
    };

    if (document.readyState === 'complete') readyToDismiss();
    else window.addEventListener('load', readyToDismiss);
    setTimeout(dismiss, MAX_SHOW);
  }

  /* ============================================================
     INTERACTIVE SPIRIT LEVEL
     Spring physics so the bubble overshoots and settles like
     fluid rather than sliding linearly. Cursor on desktop,
     device tilt on mobile, drag everywhere as the fallback.
     ============================================================ */
  var levelbar = document.querySelector('[data-level]');
  if (levelbar && !reduced) {
    var bubble = levelbar.querySelector('.levelbar__bubble');
    var state = levelbar.querySelector('.levelbar__state');
    var MIN_POS = 9, MAX_POS = 91, CENTRE = 50;
    var target = CENTRE, pos = CENTRE, vel = 0;
    var wasLevel = false, dragging = false, idleAt = performance.now();
    /* The level state is a reward for bringing it back, not the resting
       state — so it stays off until the user has actually tipped it. */
    var touched = false;

    var clamp = function (n) { return Math.max(MIN_POS, Math.min(MAX_POS, n)); };

    var frame = function () {
      /* Spring toward target: stiffness pulls, damping bleeds off velocity.
         The residual velocity is what produces the overshoot. Tuned so it
         reads as viscous fluid — one clear overshoot, then settle. Raise
         damping toward 0.9 for more wobble, drop it for a stiffer feel. */
      vel = (vel + (target - pos) * 0.055) * 0.82;
      pos += vel;
      pos = clamp(pos);
      bubble.style.insetInlineStart = pos.toFixed(2) + '%';

      var isLevel = touched && Math.abs(pos - CENTRE) < 1.2 && Math.abs(vel) < 0.12;
      if (isLevel !== wasLevel) {
        levelbar.classList.toggle('is-level', isLevel);
        if (state) state.classList.toggle('is-on', isLevel);
        wasLevel = isLevel;
        /* A short haptic on the moment it levels, where supported. */
        if (isLevel && dragging && navigator.vibrate) navigator.vibrate(12);
      }

      /* Drift back to level after a few seconds of no input. */
      if (!dragging && performance.now() - idleAt > 2600) target = CENTRE;

      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    var aim = function (ratio) {
      target = clamp(MIN_POS + ratio * (MAX_POS - MIN_POS));
      idleAt = performance.now();
      if (Math.abs(target - CENTRE) > 6) touched = true;
      levelbar.setAttribute('aria-valuenow', Math.round(target));
    };

    /* --- Desktop: bubble drifts toward the cursor --- */
    var hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (hasFinePointer) {
      window.addEventListener('mousemove', function (e) {
        if (dragging) return;
        aim(e.clientX / window.innerWidth);
      }, { passive: true });
    }

    /* --- Drag: works on every device, and is the iOS fallback --- */
    var dragTo = function (clientX) {
      var box = levelbar.getBoundingClientRect();
      aim((clientX - box.left) / box.width);
    };
    levelbar.addEventListener('pointerdown', function (e) {
      dragging = true;
      levelbar.setPointerCapture(e.pointerId);
      dragTo(e.clientX);
    });
    levelbar.addEventListener('pointermove', function (e) {
      if (dragging) dragTo(e.clientX);
    });
    var endDrag = function () { dragging = false; idleAt = performance.now(); };
    levelbar.addEventListener('pointerup', endDrag);
    levelbar.addEventListener('pointercancel', endDrag);

    /* --- Mobile: real device tilt ---
       iOS 13+ requires an explicit user gesture before it will hand over
       orientation data, so we ask on first tap rather than on load. */
    var tiltHandler = function (e) {
      if (dragging || e.gamma == null) return;
      /* gamma is left/right tilt in degrees; ±35° covers the full vial. */
      aim(0.5 + Math.max(-1, Math.min(1, e.gamma / 35)) / 2);
    };
    var DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      var askOnce = function () {
        DOE.requestPermission().then(function (r) {
          if (r === 'granted') window.addEventListener('deviceorientation', tiltHandler);
        }).catch(function () { /* denied — drag still works */ });
        levelbar.removeEventListener('pointerdown', askOnce);
      };
      levelbar.addEventListener('pointerdown', askOnce);
    } else if (DOE && !hasFinePointer) {
      window.addEventListener('deviceorientation', tiltHandler);
    }

    /* --- Keyboard: the level is operable without a pointer --- */
    levelbar.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { aim((pos - 12) / 100); e.preventDefault(); }
      if (e.key === 'ArrowRight') { aim((pos + 12) / 100); e.preventDefault(); }
      if (e.key === 'Home' || e.key === ' ') { target = CENTRE; idleAt = performance.now(); e.preventDefault(); }
    });

    /* Swap the hint text for touch devices. */
    var hint = levelbar.parentElement.querySelector('[data-level-hint]');
    if (hint && !hasFinePointer) hint.textContent = 'Tilt or drag to level';
  }

  /* ---------- Sticky header ---------- */
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('.nav__link')) {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) burger.click();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (revealables.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Hero parallax ---------- */
  var heroMedia = document.querySelector('.hero__media');
  if (heroMedia && !reduced) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        heroMedia.style.transform = 'translate3d(0,' + (y * 0.25) + 'px,0) scale(1.06)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var run = function (el) {
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      if (reduced) { el.textContent = target + suffix; return; }
      var start = performance.now(), dur = 1600;
      var tick = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(run);
    }
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.classList.toggle('is-open', !open);
    });
  });

  /* ---------- Project filters ---------- */
  var filters = document.querySelectorAll('.filter');
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.dataset.filter;
        filters.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        document.querySelectorAll('[data-category]').forEach(function (item) {
          var show = cat === 'all' || item.dataset.category === cat;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Multi-step quote form ---------- */
  var stepper = document.querySelector('[data-stepper]');
  if (stepper) {
    var steps = Array.prototype.slice.call(stepper.querySelectorAll('.stepper__step'));
    var segs = Array.prototype.slice.call(document.querySelectorAll('.progress__seg'));
    var idx = 0;

    var paint = function () {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      segs.forEach(function (s, i) { s.classList.toggle('is-done', i <= idx); });
      var label = document.querySelector('[data-step-label]');
      if (label) label.textContent = 'Step ' + (idx + 1) + ' of ' + steps.length;
      var heading = steps[idx].querySelector('h2, h3');
      if (heading) heading.setAttribute('tabindex', '-1'), heading.focus({ preventScroll: true });
    };

    var validate = function (step) {
      var ok = true;
      step.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field') || input.closest('.choices');
        var valid = input.type === 'radio'
          ? step.querySelector('input[name="' + input.name + '"]:checked')
          : input.value.trim();
        if (!valid) { ok = false; if (field) field.classList.add('has-error'); }
        else if (field) field.classList.remove('has-error');
      });
      return ok;
    };

    stepper.addEventListener('click', function (e) {
      var next = e.target.closest('[data-next]');
      var prev = e.target.closest('[data-prev]');
      if (next) {
        if (!validate(steps[idx])) return;
        if (idx < steps.length - 1) { idx++; paint(); }
      }
      if (prev && idx > 0) { idx--; paint(); }
    });

    /* Radio choice auto-advances — fewer taps on mobile */
    stepper.addEventListener('change', function (e) {
      if (e.target.matches('[data-advance] input[type="radio"]') && !reduced) {
        setTimeout(function () {
          if (idx < steps.length - 1) { idx++; paint(); }
        }, 260);
      }
    });

    stepper.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(steps[idx])) return;

      var data = new FormData(e.target);
      var payload = {};
      data.forEach(function (v, k) {
        if (typeof v === 'string' && v) payload[k] = v; /* skip the file input */
      });

      var lines = ['*New quote request — Qobban website*'];
      Object.keys(payload).forEach(function (k) {
        if (k !== 'company') lines.push(k + ': ' + payload[k]);
      });
      var phone = document.body.dataset.whatsapp || '';
      var waUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(lines.join('\n'));

      var done = document.querySelector('[data-quote-done]');
      var finish = function () {
        if (!done) { window.open(waUrl, '_blank', 'noopener'); return; }
        stepper.hidden = true;
        done.hidden = false;
        done.querySelector('[data-wa-link]').href = waUrl;
        done.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      };

      var submit = e.target.querySelector('[type="submit"]');
      if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }

      /* Record the lead server-side first, then offer WhatsApp. If the API is
         unreachable we still show the WhatsApp hand-off — a captured lead beats
         an error message. */
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(function () { /* offline or blocked — fall through */ })
        .then(finish);
    });

    paint();
  }

  /* ---------- Simple lead form (contact page) ---------- */
  var leadForm = document.querySelector('[data-lead-form]');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = leadForm.querySelector('[data-form-status]');
      var submit = leadForm.querySelector('[type="submit"]');
      var payload = {};
      new FormData(leadForm).forEach(function (v, k) {
        if (typeof v === 'string' && v) payload[k] = v;
      });

      if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }
      if (status) { status.textContent = ''; status.style.color = ''; }

      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(function (r) {
        if (r.ok) {
          leadForm.reset();
          if (status) status.textContent = 'Thanks — we’ll come back to you shortly.';
          if (submit) submit.textContent = 'Sent';
          return;
        }
        throw new Error(String(r.status));
      }).catch(function (err) {
        /* Never leave someone stuck: point them at WhatsApp instead. */
        var phone = document.body.dataset.whatsapp || '';
        if (status) {
          status.style.color = '#ff6b6b';
          status.innerHTML = err.message === '429'
            ? 'Too many messages just now. Please try again shortly, or ' +
              '<a href="https://wa.me/' + phone + '" style="color:var(--yellow)">message us on WhatsApp</a>.'
            : 'That didn’t send. Please ' +
              '<a href="https://wa.me/' + phone + '" style="color:var(--yellow)">message us on WhatsApp</a> instead.';
        }
        if (submit) { submit.disabled = false; submit.textContent = 'Send Message'; }
      });
    });
  }

  /* ============================================================
     THEME TOGGLE
     boot.js has already applied the stored/OS choice before paint;
     this only handles the click and remembers the decision.
     ============================================================ */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    var applyThemeLabel = function () {
      var dark = document.documentElement.getAttribute('data-theme') !== 'light';
      themeBtn.setAttribute('aria-label',
        dark ? 'Switch to light mode' : 'Switch to dark mode');
      themeBtn.setAttribute('aria-pressed', String(!dark));
    };
    applyThemeLabel();
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light'
        ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('qobban-theme', next); } catch (e) {}
      applyThemeLabel();
    });
  }

  /* ============================================================
     LANGUAGE TOGGLE — English / العربية
     ponytail: translates by matching the English string itself, so no
     data-i18n tagging across 13 pages. Ceiling: it is client-side, so
     Arabic is NOT indexable — when Arabic SEO matters, generate real
     /ar/ pages from these same strings. Untranslated text stays English
     rather than disappearing.
     ============================================================ */
  /* The dictionary lives in its own file and is fetched only when a visitor
     actually switches to Arabic — English visitors never download it. */
  var AR = null;
  var loadDict = function (done) {
    if (AR) { done(AR); return; }
    if (window.QobbanAR) { AR = window.QobbanAR; done(AR); return; }
    var s = document.createElement('script');
    s.src = (document.currentScript && /\/services\//.test(location.pathname) ? '../' : '')
            + 'js/ar.js?v=14';
    s.onload = function () { AR = window.QobbanAR || {}; done(AR); };
    s.onerror = function () { AR = {}; done(AR); };   /* stay English on failure */
    document.head.appendChild(s);
  };


  var langBtn = document.querySelector('[data-lang-toggle]');
  if (langBtn) {
    /* Walk text nodes and swap whole strings we have a translation for.
       Skips script/style so we never rewrite code.

       Whitespace is normalised before lookup: body copy is wrapped across
       several source lines, so the raw node value carries newlines and
       indentation. Without collapsing those, no multi-line paragraph could
       ever match a dictionary key — only the short single-line strings
       would translate, which is precisely the half-translated failure. */
    var normalise = function (s) { return s.replace(/\s+/g, ' ').trim(); };

    var translate = function (dict) {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          var tag = node.parentNode.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
          return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      var node;
      while ((node = walker.nextNode())) {
        var key = normalise(node.nodeValue);
        if (dict[key]) {
          if (!node.parentNode.dataset.en) node.parentNode.dataset.en = key;
          /* Preserve the node's own leading/trailing whitespace. A headline
             split across several nodes — "Precision is" / "our " / "standard."
             — relies on that trailing space to separate the words once they
             are re-joined. Substituting the trimmed value welds them together. */
          var pad = node.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/);
          node.nodeValue = pad[1] + dict[key] + pad[2];
        }
      }
      /* aria-labels and placeholders are attributes, not text nodes. */
      document.querySelectorAll('[aria-label], [placeholder]').forEach(function (el) {
        ['aria-label', 'placeholder'].forEach(function (attr) {
          var v = el.getAttribute(attr);
          if (v && dict[v.trim()]) el.setAttribute(attr, dict[v.trim()]);
        });
      });
    };

    var setLang = function (lang, persist) {
      var root = document.documentElement;
      if (lang === 'ar') {
        /* Font is no longer injected here — IBM Plex Sans Arabic ships in
           the page's own Google Fonts request alongside Montserrat. */
        root.lang = 'ar';
        root.dir = 'rtl';
        loadDict(function (dict) { translate(dict); });
        langBtn.textContent = 'EN';
        langBtn.setAttribute('aria-label', 'Switch to English');
      } else {
        /* Reloading is the honest way back: it restores every original
           string without keeping a reverse dictionary in sync. */
        if (persist) { try { localStorage.setItem('qobban-lang', 'en'); } catch (e) {} location.reload(); return; }
        langBtn.textContent = 'ع';
        langBtn.setAttribute('aria-label', 'التبديل إلى العربية');
      }
      if (persist) { try { localStorage.setItem('qobban-lang', lang); } catch (e) {} }
    };

    /* boot.js already set dir/lang if Arabic was stored — finish the job. */
    var stored = null;
    try { stored = localStorage.getItem('qobban-lang'); } catch (e) {}
    if (stored === 'ar') setLang('ar', false); else setLang('en', false);

    langBtn.addEventListener('click', function () {
      setLang(document.documentElement.dir === 'rtl' ? 'en' : 'ar', true);
    });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
