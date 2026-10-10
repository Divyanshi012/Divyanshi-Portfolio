(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ===== TOAST ===== */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ===== HAMBURGER MENU ===== */
  var hamburger = $('#hamburger');
  var mobileMenu = $('#mobileMenu');

  function setMenu(open) {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      setMenu(!mobileMenu.classList.contains('open'));
    });
    $all('a', mobileMenu).forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1000) setMenu(false);
    });
  }

  /* ===== SCROLL: progress bar, nav shadow, back to top ===== */
  var progress = $('#progress');
  var nav = $('#nav');
  var toTop = $('#toTop');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', y > 10);
    if (toTop) toTop.classList.toggle('show', y > 600);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ===== SCROLL REVEAL ===== */
  var revealEls = $all('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ===== ACTIVE NAV LINK ===== */
  var navLinks = $all('.nav-links a');
  var sections = $all('section[id]');

  function setActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ===== ANIMATED COUNTERS ===== */
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    var duration = 1300;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(frame);
  }

  var counters = $all('[data-count]');
  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          countObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObs.observe(c); });
  }

  /* ===== TYPING EFFECT IN HERO ===== */
  var typed = $('#typed');
  if (typed && !reduceMotion) {
    var words = [];
    try { words = JSON.parse(typed.getAttribute('data-words') || '[]'); } catch (e) { words = []; }
    if (words.length > 1) {
      var wi = 0, ci = 0, deleting = false;
      typed.textContent = '';
      (function tick() {
        var word = words[wi];
        if (!deleting) {
          ci++;
          typed.textContent = word.slice(0, ci);
          if (ci === word.length) { deleting = true; return setTimeout(tick, 1600); }
          return setTimeout(tick, 85);
        }
        ci--;
        typed.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; return setTimeout(tick, 350); }
        return setTimeout(tick, 45);
      })();
    }
  }

  /* ===== SPOTLIGHT HOVER ON CARDS ===== */
  $all('.spot').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ===== COPY EMAIL ===== */
  var EMAIL = 'divyanshinagar12@gmail.com';
  var copyBtn = $('#copyEmail');

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      function done() { toast('Email copied'); }
      function fail() { toast(fallbackCopy(EMAIL) ? 'Email copied' : 'Copy failed. Select it manually.'); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(done, fail);
      } else {
        fail();
      }
    });
  }

  /* ===== CONTACT FORM (opens the visitor's email app) ===== */
  var form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#fName').value.trim();
      var email = $('#fEmail').value.trim();
      var msg = $('#fMsg').value.trim();
      var valid = true;

      [['#fName', name], ['#fEmail', email], ['#fMsg', msg]].forEach(function (pair) {
        var el = $(pair[0]);
        var bad = !pair[1] || (pair[0] === '#fEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pair[1]));
        el.classList.toggle('invalid', bad);
        if (bad) valid = false;
      });

      if (!valid) { toast('Please fill in all fields'); return; }

      var subject = 'Portfolio enquiry from ' + name;
      var body = msg + '\n\n' + name + '\n' + email;
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      toast('Opening your email app');
    });

    $all('input, textarea', form).forEach(function (el) {
      el.addEventListener('input', function () { el.classList.remove('invalid'); });
    });
  }

  /* ===== FOOTER YEAR ===== */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
