/* ==========================================================================
   ESCAPE ROOM PUZZLE GAME — js/results.js

   Used by victory.html and game-over.html.
   Reads the game summary saved by js/game.js and shows the real numbers.
   If the page is opened directly (no finished game), the sample numbers
   already written in the HTML are left as they are.
   ========================================================================== */

(function () {
  'use strict';

  var result = null;
  try {
    result = JSON.parse(window.sessionStorage.getItem('escapeRoomResult'));
  } catch (e) { /* storage blocked or empty */ }
  if (!result) { return; }

  // Only show a summary on the page that matches how the game ended
  var onVictoryPage = !!document.querySelector('.victory-card');
  if ((result.outcome === 'victory') !== onVictoryPage) { return; }

  function setText(id, text) {
    var node = document.getElementById(id);
    if (node) { node.textContent = text; }
  }

  function formatTime(totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var s = totalSeconds % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  // Play Again must reuse this difficulty, so make sure it is the saved one
  if (result.difficulty) {
    try { window.sessionStorage.setItem('escapeRoomDifficulty', result.difficulty); } catch (e) { /* ignore */ }
  }

  setText('result-difficulty', result.difficultyName || '');
  setText('result-time-used', formatTime(result.timeUsed || 0));
  setText('result-score', String(result.score));
  setText('result-time', formatTime(result.timeLeft));
  setText('result-solved', result.puzzlesSolved + ' / ' + result.totalPuzzles);
})();
