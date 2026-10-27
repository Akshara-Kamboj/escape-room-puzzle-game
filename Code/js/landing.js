/* ==========================================================================
   ESCAPE ROOM PUZZLE GAME — js/landing.js

   Small helpers for the landing page (index.html). Theme logic is NOT here:
   the existing js/themes.js still owns the theme selector.

   1. Fill the time limits and riddle counts from js/puzzles.js, so the page
      can never disagree with the real game data.
   2. Mobile menu (open / close / Escape key).
   3. Fade-up reveal of sections as they scroll into view.
   4. Highlight the nav link of the section you are reading.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------- 1. Real numbers from puzzles.js ---------- */

  function setBind(name, text) {
    var nodes = document.querySelectorAll('[data-bind="' + name + '"]');
    for (var i = 0; i < nodes.length; i++) { nodes[i].textContent = text; }
  }

  function fillGameFacts() {
    var data = window.EscapeRoomData;
    if (!data || !data.levels || !data.levelOrder) { return; }   // keep the written defaults

    var minutes = [];
    var counts = [];

    data.levelOrder.forEach(function (id) {
      var level = data.levels[id];
      if (!level) { return; }
      var mins = Math.round(level.timeLimitSeconds / 60);
      minutes.push(mins);
      counts.push(level.puzzles.length);
      setBind('minutes-' + id, String(mins));
      setBind('count-' + id, String(level.puzzles.length));
    });

    if (minutes.length) { setBind('all-minutes', minutes.join(' / ')); }

    // "5 Riddles Per Level" is only honest if every level has the same number
    var same = counts.length > 0 && counts.every(function (n) { return n === counts[0]; });
    if (same) { setBind('riddle-count', String(counts[0])); }
  }


  /* ---------- 2. Mobile menu ---------- */

  function initMenu() {
    var toggle = document.getElementById('nav-toggle');
    var panel = document.getElementById('nav-panel');
    var nav = document.querySelector('.site-nav');
    if (!toggle || !panel || !nav) { return; }

    function setOpen(open) {
      panel.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Choosing a link closes the menu
    panel.addEventListener('click', function (event) {
      if (event.target.closest && event.target.closest('a')) { setOpen(false); }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Clicking outside the menu closes it
    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !nav.contains(event.target)) {
        setOpen(false);
      }
    });

    // Growing the window to desktop width resets the menu
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (query) {
      if (query.matches) { setOpen(false); }
    });

    // Soft shadow under the bar once the page has scrolled
    function markScrolled() {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', markScrolled, { passive: true });
    markScrolled();
  }


  /* ---------- 3. Reveal on scroll ---------- */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) { return; }   // stay visible

    document.documentElement.classList.add('js-reveal');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);          // animate only once
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    for (var i = 0; i < items.length; i++) { observer.observe(items[i]); }
  }


  /* ---------- 4. Active nav link ---------- */

  function initActiveLink() {
    if (!('IntersectionObserver' in window)) { return; }

    var links = document.querySelectorAll('.nav-link');
    var byId = {};
    var sections = [];

    for (var i = 0; i < links.length; i++) {
      var id = (links[i].getAttribute('href') || '').replace('#', '');
      var target = id && document.getElementById(id);
      if (target) { byId[id] = links[i]; sections.push(target); }
    }

    function mark(id) {
      for (var key in byId) {
        var on = key === id;
        byId[key].classList.toggle('is-active', on);
        if (on) { byId[key].setAttribute('aria-current', 'true'); }
        else { byId[key].removeAttribute('aria-current'); }
      }
    }

    // The section crossing the upper part of the screen is "current".
    // The About link points at the footer, which only counts once it is on screen.
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { mark(entry.target.id); }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(function (section) { observer.observe(section); });
    mark('home');
  }


  fillGameFacts();
  initMenu();
  initReveal();
  initActiveLink();
})();