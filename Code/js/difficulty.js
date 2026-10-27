/* ==========================================================================
   ESCAPE ROOM PUZZLE GAME — js/difficulty.js

   Builds the Easy / Medium / Hard cards on difficulty.html from the data in
   js/puzzles.js, and handles Select Level + Start Game.

   - Choosing a card only highlights it. NOTHING is started.
   - Start Game saves the choice and opens game.html. The timer begins there,
     when the game itself begins.
   ========================================================================== */

(function () {
  'use strict';

  var data = window.EscapeRoomData;
  var DIFFICULTY_KEY = 'escapeRoomDifficulty';

  var grid = document.getElementById('difficulty-grid');
  var startBtn = document.getElementById('start-btn');
  var status = document.getElementById('difficulty-status');
  if (!data || !data.levels || !grid || !startBtn || !status) { return; }

  var PIPS = { easy: 1, medium: 2, hard: 3 };   // decoration: 1-3 filled dots
  var selected = null;
  var cards = {};

  function hasLevel(id) {
    return typeof id === 'string' &&
      Object.prototype.hasOwnProperty.call(data.levels, id);
  }

  function readChoice() {
    try { return window.sessionStorage.getItem(DIFFICULTY_KEY); } catch (e) { return null; }
  }

  function saveChoice(id) {
    try { window.sessionStorage.setItem(DIFFICULTY_KEY, id); } catch (e) { /* ignore */ }
  }

  function formatTime(totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var s = totalSeconds % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text) { node.textContent = text; }
    return node;
  }

  function buildCard(level) {
    var card = el('article', 'difficulty-card');
    card.setAttribute('data-level', level.id);

    var top = el('div', 'difficulty-card__top');
    var pips = el('span', 'difficulty-pips');
    pips.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 3; i++) {
      pips.appendChild(el('span', 'difficulty-pip' + (i < PIPS[level.id] ? ' is-on' : '')));
    }
    top.appendChild(pips);
    top.appendChild(el('span', 'badge badge--applied', 'Selected'));

    var name = el('h2', 'difficulty-card__name', level.name);
    var desc = el('p', 'difficulty-card__desc', level.description);

    var facts = el('dl', 'difficulty-facts');
    function fact(label, value) {
      var box = el('div', 'difficulty-fact');
      box.appendChild(el('dt', '', label));
      box.appendChild(el('dd', '', value));
      facts.appendChild(box);
    }
    fact('Time limit', formatTime(level.timeLimitSeconds));
    fact('Riddles', String(level.puzzles.length));

    var btn = el('button', 'btn btn-secondary difficulty-card__btn', 'Select Level');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Select ' + level.name + ' level');
    btn.addEventListener('click', function () { select(level.id); });

    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(desc);
    card.appendChild(facts);
    card.appendChild(btn);
    return card;
  }

  function select(id) {
    selected = id;
    data.levelOrder.forEach(function (levelId) {
      var card = cards[levelId];
      var isOn = levelId === id;
      var btn = card.querySelector('.difficulty-card__btn');
      card.classList.toggle('is-selected', isOn);
      btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      btn.textContent = isOn ? '\u2713 Selected' : 'Select Level';
      btn.classList.toggle('btn-primary', isOn);
      btn.classList.toggle('btn-secondary', !isOn);
    });
    startBtn.disabled = false;
    var level = data.levels[id];
    status.textContent = level.name + ' selected: ' + level.puzzles.length +
      ' riddles, ' + formatTime(level.timeLimitSeconds) +
      '. The timer starts when you press Start Game.';
  }

  data.levelOrder.forEach(function (id) {
    if (!hasLevel(id)) { return; }
    cards[id] = buildCard(data.levels[id]);
    grid.appendChild(cards[id]);
  });

  startBtn.addEventListener('click', function () {
    if (!selected || startBtn.disabled) { return; }
    startBtn.disabled = true;               // ignore repeated clicks
    saveChoice(selected);
    window.location.href = 'game.html';
  });

  // A level opened from the home page (difficulty.html?level=hard) is only
  // highlighted. Nothing is saved or started until Start Game is pressed.
  function readRequestedLevel() {
    try { return new URLSearchParams(window.location.search).get('level'); } catch (e) { return null; }
  }

  // Re-highlight the level used last time (e.g. after Change Difficulty)
  var requested = readRequestedLevel();
  var previous = readChoice();
  if (hasLevel(requested) && cards[requested]) {
    select(requested);
    status.textContent = data.levels[requested].name + ' chosen from the home page: ' +
      data.levels[requested].puzzles.length + ' riddles, ' +
      formatTime(data.levels[requested].timeLimitSeconds) +
      '. Pick another level or press Start Game. The timer starts only then.';
  } else if (hasLevel(previous) && cards[previous]) {
    select(previous);
    status.textContent = 'Last played: ' + data.levels[previous].name +
      '. Pick another level or press Start Game.';
  } else {
    status.textContent = 'Select a level to enable Start Game.';
  }

  // Coming back with the browser Back button: the page may be restored as it was
  window.addEventListener('pageshow', function (event) {
    if (event.persisted && selected) { startBtn.disabled = false; }
  });
})();