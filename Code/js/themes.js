/* ==========================================================================
   ESCAPE ROOM PUZZLE GAME — js/themes.js

   One reusable theme system shared by all five pages.

   What it does
   1. Reads the saved theme from localStorage (or uses Lavender Dream).
   2. Sets  <html data-theme="...">  immediately, before the page is painted,
      so there is no flash of the wrong theme.
   3. On the Home page only, builds the "Choose Your Theme" cards, handles
      Preview / Apply / Cancel and saves the choice.

   The COLORS live in css/style.css (section 1). This file only knows each
   theme's id, name and short description.

   TO ADD A THEME: add an entry to THEMES below, and a matching
   [data-theme="your-id"] block in css/style.css.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'escapeRoomTheme';
  var DEFAULT_THEME = 'lavender-dream';

  var THEMES = [
    { id: 'lavender-dream',   name: 'Lavender Dream',   description: 'Clean, modern and softly lavender.' },
    { id: 'midnight-mystery', name: 'Midnight Mystery', description: 'Dark, cinematic and immersive.' },
    { id: 'enchanted-forest', name: 'Enchanted Forest', description: 'Calm, earthy and a little magical.' },
    { id: 'retro-arcade',     name: 'Retro Arcade',     description: 'Playful colors from classic arcades.' },
    { id: 'cyber-lab',        name: 'Cyber Lab',        description: 'Futuristic, digital and sci-fi.' },
    { id: 'sunset-escape',    name: 'Sunset Escape',    description: 'Warm, cheerful sunset gradients.' }
  ];

  /* ---------- helpers ---------- */

  function findTheme(id) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) { return THEMES[i]; }
    }
    return null;
  }

  function isValidTheme(id) {
    return findTheme(id) !== null;
  }

  /* localStorage can throw (private mode, blocked storage), so every access
     is wrapped in try/catch and the site keeps working without it. */
  function readSavedTheme() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      if (isValidTheme(value)) { return value; }
      if (value !== null) { window.localStorage.removeItem(STORAGE_KEY); } // clean up bad value
    } catch (e) { /* ignore */ }
    return DEFAULT_THEME;
  }

  function saveTheme(id) {
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
      return true;
    } catch (e) {
      return false;
    }
  }

  function applyTheme(id) {
    document.documentElement.setAttribute('data-theme', isValidTheme(id) ? id : DEFAULT_THEME);
  }

  /* ---------- run immediately (script is loaded in <head>) ---------- */

  var savedTheme = readSavedTheme();
  applyTheme(savedTheme);

  /* ---------- Home page: theme selector ---------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text) { node.textContent = text; }
    return node;
  }

  function buildCard(theme) {
    var label = el('label', 'theme-card');
    label.setAttribute('data-theme-id', theme.id);

    var input = el('input', 'theme-card__input');
    input.type = 'radio';
    input.name = 'theme';
    input.value = theme.id;

    var body = el('span', 'theme-card__body');

    // Mini preview. It carries its own data-theme, so CSS paints it
    // with that theme's palette no matter which theme the page uses.
    var preview = el('span', 'theme-preview');
    preview.setAttribute('data-theme', theme.id);
    preview.setAttribute('aria-hidden', 'true');

    var win = el('span', 'theme-preview__window');
    win.appendChild(el('span', 'theme-preview__line'));
    win.appendChild(el('span', 'theme-preview__line theme-preview__line--short'));
    win.appendChild(el('span', 'theme-preview__button'));
    preview.appendChild(win);

    var swatches = el('span', 'theme-preview__swatches');
    ['bg', 'card', 'primary', 'secondary', 'text'].forEach(function (name) {
      swatches.appendChild(el('span', 'theme-swatch theme-swatch--' + name));
    });
    preview.appendChild(swatches);

    var top = el('span', 'theme-card__top');
    top.appendChild(el('span', 'theme-card__name', theme.name));
    var badges = el('span', 'theme-card__badges');
    badges.appendChild(el('span', 'badge badge--applied', 'Applied'));
    badges.appendChild(el('span', 'badge badge--preview', 'Previewing'));
    top.appendChild(badges);

    body.appendChild(preview);
    body.appendChild(top);
    body.appendChild(el('span', 'theme-card__desc', theme.description));

    label.appendChild(input);
    label.appendChild(body);
    return label;
  }

  /* Pages without the selector: keep the theme correct after back/forward
     navigation and when the theme is changed in another tab. */
  function keepPageInSync() {
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) { applyTheme(readSavedTheme()); }
    });
    window.addEventListener('storage', function (event) {
      if (event.key === STORAGE_KEY) { applyTheme(readSavedTheme()); }
    });
  }

  function initSelector() {
    var grid = document.getElementById('theme-grid');
    var applyBtn = document.getElementById('theme-apply');
    var cancelBtn = document.getElementById('theme-cancel');
    var status = document.getElementById('theme-status');
    if (!grid || !applyBtn || !cancelBtn || !status) {   // not the Home page
      keepPageInSync();
      return;
    }

    var previewTheme = savedTheme;   // theme currently shown (may be unsaved)
    var cards = {};

    THEMES.forEach(function (theme) {
      var card = buildCard(theme);
      cards[theme.id] = card;
      grid.appendChild(card);
    });

    function setStatus(message, applied) {
      status.textContent = '';
      status.className = 'theme-status' + (applied ? ' is-applied' : '');
      if (applied) {
        var tick = el('span', '', '\u2713 ');
        tick.setAttribute('aria-hidden', 'true');
        status.appendChild(tick);
      }
      status.appendChild(document.createTextNode(message));
    }

    function refresh() {
      THEMES.forEach(function (theme) {
        var card = cards[theme.id];
        var isSaved = theme.id === savedTheme;
        var isPreview = theme.id === previewTheme && previewTheme !== savedTheme;
        card.classList.toggle('is-applied', isSaved);
        card.classList.toggle('is-previewing', isPreview);
        card.querySelector('input').checked = theme.id === previewTheme;
      });
      var pending = previewTheme !== savedTheme;
      applyBtn.disabled = !pending;
      cancelBtn.disabled = !pending;
    }

    function showIdleStatus() {
      setStatus('Current theme: ' + findTheme(savedTheme).name + '. Pick a card to preview another.', false);
    }

    grid.addEventListener('change', function (event) {
      if (!event.target || event.target.name !== 'theme') { return; }
      previewTheme = event.target.value;
      applyTheme(previewTheme);                       // live preview, NOT saved
      refresh();
      if (previewTheme !== savedTheme) {
        setStatus('Previewing ' + findTheme(previewTheme).name + ' \u2014 not saved yet. Choose Apply Theme to keep it.', false);
      } else {
        showIdleStatus();
      }
    });

    applyBtn.addEventListener('click', function () {
      var name = findTheme(previewTheme).name;
      var stored = saveTheme(previewTheme);
      savedTheme = previewTheme;
      applyTheme(savedTheme);
      refresh();
      if (stored) {
        setStatus(name + ' applied. It will be used on every page.', true);
      } else {
        setStatus(name + ' applied for this page only. Your browser blocked saving it.', false);
      }
    });

    cancelBtn.addEventListener('click', function () {
      previewTheme = savedTheme;
      applyTheme(savedTheme);
      refresh();
      showIdleStatus();
    });

    // Keep this page in sync if the theme is changed in another tab
    window.addEventListener('storage', function (event) {
      if (event.key !== STORAGE_KEY) { return; }
      savedTheme = readSavedTheme();
      previewTheme = savedTheme;
      applyTheme(savedTheme);
      refresh();
      showIdleStatus();
    });

    // Back/forward cache: re-check what is really saved
    window.addEventListener('pageshow', function (event) {
      if (!event.persisted) { return; }
      savedTheme = readSavedTheme();
      previewTheme = savedTheme;
      applyTheme(savedTheme);
      refresh();
      showIdleStatus();
    });

    refresh();
    showIdleStatus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSelector);
  } else {
    initSelector();
  }
})();
