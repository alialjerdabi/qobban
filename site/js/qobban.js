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
      var lines = ['*New quote request — Qobban website*'];
      data.forEach(function (v, k) { if (v) lines.push(k + ': ' + v); });
      /* No backend yet: hand the qualified lead straight to WhatsApp. */
      var phone = document.body.dataset.whatsapp || '';
      var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(lines.join('\n'));
      var done = document.querySelector('[data-quote-done]');
      if (done) {
        stepper.hidden = true;
        done.hidden = false;
        done.querySelector('[data-wa-link]').href = url;
        done.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      } else {
        window.open(url, '_blank', 'noopener');
      }
    });

    paint();
  }

  /* ---------- i18n scaffold (English active, Arabic ready) ---------- */
  window.QobbanI18n = {
    /* Switching to 'ar' flips <html dir> and swaps [data-i18n] strings.
       Arabic dictionary is intentionally empty until copy is written —
       see BRAND/Tone_of_Voice.md: Arabic is a rewrite, not a translation. */
    set: function (lang) {
      var dict = this.dictionaries[lang];
      if (!dict) return false;
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.dataset.i18n;
        if (dict[key]) el.textContent = dict[key];
      });
      try { localStorage.setItem('qobban-lang', lang); } catch (e) {}
      return true;
    },
    dictionaries: { en: {}, ar: {} }
  };

  /* ---------- Current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
