/* ==========================================================================
   ESCAPE ROOM PUZZLE GAME — js/game.js

   The game engine for game.html. Needs js/puzzles.js loaded first.

   The player picks Easy, Medium or Hard on difficulty.html. That choice is
   kept in sessionStorage; this file loads only that level's riddles and
   uses that level's time limit.

   How it works
   - A game "session" is a small object (see newSession) that is saved in
     sessionStorage after every change.
   - The timer stores an END TIMESTAMP (session.endsAt). Time left is always
     calculated as  endsAt - now,  so it stays correct if the tab sleeps,
     lags or the page is refreshed.
   - Opening game.html from a link (Start Game, Try Again, Play Again)
     begins a NEW session. Refreshing the page resumes the current one.
   - When the game ends, a summary is saved and the player is sent to
     victory.html or game-over.html (read by js/results.js).
   ========================================================================== */

(function () {
  'use strict';

  var data = window.EscapeRoomData;
  if (!data || !data.levels) { return; }   // puzzles.js missing: leave page as it is

  var CONFIG = data.config;
  var SESSION_KEY = 'escapeRoomSession';
  var RESULT_KEY = 'escapeRoomResult';
  var DIFFICULTY_KEY = 'escapeRoomDifficulty';   // set on difficulty.html

  var level = null;        // the chosen level object (easy / medium / hard)
  var PUZZLES = [];        // only the riddles of the chosen level
  var session = null;      // current game state (null until started)
  var timerId = null;      // the ONE timer interval (never more than one)
  var locked = false;      // true while moving on to the next screen
  var initialised = false; // guards against double start-up / duplicate listeners
  var ui = {};             // cached page elements


  /* ---------- storage helpers (wrapped: storage may be blocked) ---------- */

  function readJSON(key) {
    try {
      var raw = window.sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function writeJSON(key, value) {
    try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  function readString(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }

  function removeKey(key) {
    try { window.sessionStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function saveSession() { writeJSON(SESSION_KEY, session); }


  /* ---------- small utilities ---------- */

  /* Lowercase and strip everything except letters and numbers,
     so "4 8", "4-8" and "Keyboard!" all compare cleanly. */
  function normalise(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function formatTime(totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var s = totalSeconds % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function hasLevel(id) {
    return typeof id === 'string' &&
      Object.prototype.hasOwnProperty.call(data.levels, id);
  }

  function setLevel(id) {
    level = data.levels[id];
    PUZZLES = level.puzzles;
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function currentPuzzle() { return PUZZLES[session.index]; }

  /* Seconds left, calculated from the end timestamp. Never negative. */
  function secondsLeft() {
    return Math.max(0, Math.ceil((session.endsAt - Date.now()) / 1000));
  }

  /* Did the page load by refresh / back-forward (resume) or by a link (new)? */
  function isReloadNavigation() {
    try {
      var entries = window.performance.getEntriesByType('navigation');
      return !!entries.length && (entries[0].type === 'reload' || entries[0].type === 'back_forward');
    } catch (e) { return false; }
  }


  /* ---------- session lifecycle ---------- */

  function newSession() {
    var now = Date.now();
    return {
      status: 'playing',
      difficulty: level.id,     // easy / medium / hard
      index: 0,                 // which puzzle the player is on
      score: 0,
      solvedIds: [],            // ids already solved (stops point farming)
      hintsUsed: 0,             // hints used on the CURRENT puzzle
      wrongAttempts: 0,         // wrong answers on the CURRENT puzzle
      totalHints: 0,
      totalWrong: 0,
      startedAt: now,
      endsAt: now + level.timeLimitSeconds * 1000
    };
  }

  function validSession(s) {
    return !!s && s.status === 'playing' && hasLevel(s.difficulty) &&
      typeof s.endsAt === 'number' && typeof s.index === 'number' &&
      s.index >= 0 && s.index < data.levels[s.difficulty].puzzles.length &&
      Array.isArray(s.solvedIds);
  }

  /* Returns false if no difficulty was chosen (player is sent to pick one). */
  function startGame() {
    var saved = readJSON(SESSION_KEY);
    if (isReloadNavigation() && validSession(saved)) {
      setLevel(saved.difficulty);            // resume after refresh: same level,
      session = saved;                       // same end timestamp, no extra time
      // Refreshed in the short pause after a correct answer? Finish that step.
      if (session.solvedIds.length >= PUZZLES.length) {
        endGame('victory');
        return true;
      }
      if (session.solvedIds.indexOf(currentPuzzle().id) !== -1) {
        session.index += 1;
        session.hintsUsed = 0;
        session.wrongAttempts = 0;
        saveSession();
      }
    } else {
      var chosen = readString(DIFFICULTY_KEY);
      if (!hasLevel(chosen)) {
        window.location.replace('difficulty.html');
        return false;
      }
      removeKey(RESULT_KEY);
      setLevel(chosen);
      session = newSession();                // fresh game: score, hints, timer reset
      saveSession();
    }
    locked = false;
    ui.levelBadge.textContent = level.name;
    renderPuzzle(false);
    renderScore();
    startTimer();
    return true;
  }


  /* ---------- timer ---------- */

  function startTimer() {
    stopTimer();                              // make sure only one exists
    tick();
    timerId = window.setInterval(tick, 250);
  }

  function stopTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function tick() {
    if (!session || session.status !== 'playing') { return; }
    var left = secondsLeft();
    var text = formatTime(left);
    if (ui.time.textContent !== text) { ui.time.textContent = text; }
    ui.timeBox.classList.toggle('is-low', left <= CONFIG.lowTimeSeconds);
    if (left <= 0) { endGame('gameover'); }
  }


  /* ---------- rendering ---------- */

  function setFeedback(message, kind) {
    ui.feedback.textContent = message || '';
    ui.feedback.className = 'feedback' + (kind ? ' is-' + kind : '');
  }

  function renderScore() {
    ui.score.textContent = String(session.score);
  }

  function renderHints() {
    var puzzle = currentPuzzle();
    var shown = puzzle.hints.slice(0, session.hintsUsed);
    ui.hintBox.textContent = '';
    shown.forEach(function (hint, i) {
      var p = document.createElement('p');
      var label = document.createElement('strong');
      label.textContent = 'Hint ' + (i + 1) + ': ';
      p.appendChild(label);
      p.appendChild(document.createTextNode(hint));
      ui.hintBox.appendChild(p);
    });
    ui.hintBox.hidden = shown.length === 0;

    var left = puzzle.hints.length - session.hintsUsed;
    ui.hintBtn.textContent = left > 0 ? '\uD83D\uDCA1 Hint (' + left + ' left)' : '\uD83D\uDCA1 No hints left';
    ui.hintBtn.disabled = left <= 0 || locked;
  }

  /* One reusable function that draws whichever puzzle is current. */
  function renderPuzzle(moveFocus) {
    var puzzle = currentPuzzle();
    var number = session.index + 1;
    var total = PUZZLES.length;

    ui.roomTitle.textContent = 'Room ' + pad2(number);
    ui.progressText.textContent = 'Puzzle ' + number + ' / ' + total;
    ui.footerRoom.textContent = 'Room ' + number + ' of ' + total;
    ui.puzzleLabel.textContent = 'PUZZLE ' + pad2(number);
    ui.puzzleTitle.textContent = puzzle.title;
    ui.description.textContent = puzzle.description;
    ui.clue.textContent = puzzle.clue;
    ui.answerLabel.textContent = puzzle.instructions;
    ui.input.placeholder = puzzle.placeholder;
    ui.input.value = '';
    ui.input.classList.remove('is-wrong');
    ui.input.disabled = false;
    ui.submitBtn.disabled = false;

    ui.progressFill.style.width = Math.round((number / total) * 100) + '%';
    ui.progressBar.setAttribute('role', 'progressbar');
    ui.progressBar.setAttribute('aria-valuemin', '1');
    ui.progressBar.setAttribute('aria-valuemax', String(total));
    ui.progressBar.setAttribute('aria-valuenow', String(number));
    ui.progressBar.setAttribute('aria-valuetext', 'Puzzle ' + number + ' of ' + total);

    setFeedback('', '');
    renderHints();
    if (moveFocus) { ui.input.focus(); }
  }

  function setControlsEnabled(enabled) {
    ui.input.disabled = !enabled;
    ui.submitBtn.disabled = !enabled;
    ui.hintBtn.disabled = !enabled;
  }


  /* ---------- player actions ---------- */

  function isCorrect(puzzle, answer) {
    var given = normalise(answer);
    return puzzle.answers.some(function (accepted) {
      return normalise(accepted) === given;
    });
  }

  function submitAnswer() {
    if (!session || session.status !== 'playing' || locked) { return; }

    // No answers after the time is up, even if the timer has not ticked yet
    if (secondsLeft() <= 0) { endGame('gameover'); return; }

    var puzzle = currentPuzzle();
    var answer = ui.input.value.trim();

    if (answer === '') {
      setFeedback('Type an answer first.', 'error');
      ui.input.focus();
      return;
    }

    // A puzzle can only pay out once
    if (session.solvedIds.indexOf(puzzle.id) !== -1) { return; }

    if (isCorrect(puzzle, answer)) {
      handleCorrect(puzzle);
    } else {
      handleWrong();
    }
  }

  function handleWrong() {
    session.wrongAttempts += 1;
    session.totalWrong += 1;
    saveSession();
    setFeedback('That isn’t right. Look at the clue again and try once more.', 'error');
    ui.input.classList.remove('is-wrong');
    void ui.input.offsetWidth;                // restart the small shake animation
    ui.input.classList.add('is-wrong');
    ui.input.select();
  }

  function handleCorrect(puzzle) {
    locked = true;
    setControlsEnabled(false);

    var award = puzzle.points
      - session.hintsUsed * CONFIG.hintPenalty
      - session.wrongAttempts * CONFIG.wrongPenalty;
    award = Math.max(CONFIG.minimumPuzzlePoints, award);

    session.solvedIds.push(puzzle.id);
    session.score += award;
    saveSession();
    renderScore();

    var isLast = session.solvedIds.length >= PUZZLES.length;
    if (isLast) {
      session.frozenLeft = secondsLeft();     // time left is fixed at the final solve
      saveSession();
      stopTimer();                            // freeze the clock on the final solve
      setFeedback('Correct! +' + award + ' points. The final door opens…', 'success');
      window.setTimeout(function () { endGame('victory'); }, CONFIG.nextPuzzleDelayMs);
    } else {
      setFeedback('Correct! +' + award + ' points. Moving to the next room…', 'success');
      window.setTimeout(nextPuzzle, CONFIG.nextPuzzleDelayMs);
    }
  }

  function nextPuzzle() {
    if (!session || session.status !== 'playing') { return; }
    session.index += 1;
    session.hintsUsed = 0;
    session.wrongAttempts = 0;
    saveSession();
    locked = false;
    renderPuzzle(true);
  }

  function useHint() {
    if (!session || session.status !== 'playing' || locked) { return; }
    if (secondsLeft() <= 0) { endGame('gameover'); return; }
    var puzzle = currentPuzzle();
    if (session.hintsUsed >= puzzle.hints.length) { return; }
    session.hintsUsed += 1;
    session.totalHints += 1;
    saveSession();
    renderHints();
    setFeedback('Hint used (−' + CONFIG.hintPenalty + ' points if you solve this puzzle).', 'info');
  }


  /* ---------- ending the game ---------- */

  function endGame(outcome) {
    if (!session || session.status !== 'playing') { return; }  // only ever ends once

    session.status = 'finished';
    stopTimer();
    locked = true;
    setControlsEnabled(false);

    var left = 0;
    if (outcome === 'victory') {
      left = typeof session.frozenLeft === 'number' ? session.frozenLeft : secondsLeft();
    }
    var bonus = outcome === 'victory' ? left * CONFIG.timeBonusPerSecond : 0;
    var finalScore = session.score + bonus;

    writeJSON(RESULT_KEY, {
      outcome: outcome,
      difficulty: level.id,
      difficultyName: level.name,
      timeLimitSeconds: level.timeLimitSeconds,
      timeUsed: level.timeLimitSeconds - left,
      score: finalScore,
      bonus: bonus,
      puzzlesSolved: session.solvedIds.length,
      totalPuzzles: PUZZLES.length,
      timeLeft: left,
      hintsUsed: session.totalHints,
      wrongAttempts: session.totalWrong,
      elapsedSeconds: Math.min(level.timeLimitSeconds,
        Math.round((Date.now() - session.startedAt) / 1000)),
      finishedAt: new Date().toISOString()
    });
    removeKey(SESSION_KEY);

    if (outcome === 'gameover') {
      setFeedback('Time’s up!', 'error');
    }
    window.location.replace(outcome === 'victory' ? 'victory.html' : 'game-over.html');
  }


  /* ---------- start-up ---------- */

  function init() {
    if (initialised) { return; }
    initialised = true;

    function byId(id) { return document.getElementById(id); }
    ui = {
      time: byId('time-display'),
      timeBox: byId('time-box'),
      score: byId('score-display'),
      roomTitle: byId('room-title'),
      progressText: byId('progress-text'),
      progressBar: byId('progress-bar'),
      progressFill: byId('progress-fill'),
      puzzleLabel: byId('puzzle-label'),
      puzzleTitle: byId('puzzle-title'),
      description: byId('puzzle-description'),
      clue: byId('clue-text'),
      answerLabel: byId('answer-label'),
      input: byId('answer'),
      submitBtn: byId('submit-btn'),
      hintBtn: byId('hint-btn'),
      hintBox: byId('hint-box'),
      feedback: byId('feedback'),
      footerRoom: byId('footer-room'),
      levelBadge: byId('level-badge')
    };

    for (var key in ui) {
      if (!ui[key]) { return; }                // a required element is missing
    }

    // Listeners are added exactly once, here.
    ui.submitBtn.addEventListener('click', submitAnswer);
    ui.hintBtn.addEventListener('click', useHint);
    ui.input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitAnswer();
      }
    });
    ui.input.addEventListener('input', function () {
      ui.input.classList.remove('is-wrong');
    });

    // After the tab was asleep, update the clock straight away
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { tick(); }
    });

    // Restored from the back/forward cache: the saved session is the truth
    window.addEventListener('pageshow', function (event) {
      if (!event.persisted) { return; }
      var saved = readJSON(SESSION_KEY);
      if (validSession(saved)) {
        setLevel(saved.difficulty);
        session = saved;
        locked = false;
        renderPuzzle(false);
        renderScore();
        startTimer();
      }
    });

    startGame();
  }

  init();
})();
