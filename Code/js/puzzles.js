/* ==========================================================================
   ESCAPE ROOM PUZZLE GAME — js/puzzles.js

   Game settings, difficulty levels and riddles. This file is DATA ONLY.
   The game rules live in js/game.js, the level screen in js/difficulty.js.

   TO CHANGE A TIME LIMIT:  edit timeLimitSeconds on the level.
   TO EDIT / ADD A RIDDLE:  edit that level's puzzles list. The counter
                            ("Puzzle 1 / 5"), progress bar and level card
                            read the list length, so they adjust themselves.
   TO ADD A LEVEL:          add an entry to levels and to levelOrder.

   Puzzle fields
     id           unique text id (must be different in every level)
     type         label for your own reference (code, riddle, pattern, ...)
     title        heading shown above the puzzle
     description  short story text
     clue         the riddle / clue shown in the clue box
     instructions label shown above the answer box
     placeholder  grey text inside the empty answer box
     answers      accepted answers. Checking ignores UPPER/lower case, spaces
                  and punctuation, so "4 8" and "4-8" both match "48".
     hints        shown one at a time; every hint costs points
     points       base score for solving the riddle
   ========================================================================== */

window.EscapeRoomData = {

  /* Rules shared by every level */
  config: {
    hintPenalty: 25,             // points lost per hint used
    wrongPenalty: 5,             // points lost per wrong answer
    minimumPuzzlePoints: 20,     // a solved riddle is always worth at least this
    timeBonusPerSecond: 1,       // bonus per second left, added on victory only
    lowTimeSeconds: 60,          // timer turns to a warning color below this
    nextPuzzleDelayMs: 1200      // pause to read the success message
  },

  /* Order the cards appear on the difficulty screen */
  levelOrder: ['easy', 'medium', 'hard'],

  levels: {

    /* ====================================================================
       EASY — 04:00 — simple, clear answers
       ==================================================================== */
    easy: {
      id: 'easy',
      name: 'Easy',
      description: 'Beginner-friendly, straightforward riddles.',
      timeLimitSeconds: 4 * 60,
      puzzles: [
        {
          id: 'easy-hidden-code',
          type: 'code',
          title: 'Find the Hidden Code',
          description:
            'You discover a mysterious locked box in the room. ' +
            'A note beside it contains a clue. ' +
            'Enter the correct code to unlock it.',
          clue:
            'The first number is greater than 3. ' +
            'The second number is twice the first.',
          instructions: 'Enter the two-digit code',
          placeholder: 'Enter code',
          answers: ['48'],
          hints: [
            'The code has two digits, and a single digit can only go up to 9.',
            'Try 4 as the first digit. What is double of 4?'
          ],
          points: 100
        },
        {
          id: 'easy-keyboard',
          type: 'riddle',
          title: 'Answer the Riddle',
          description:
            'A dusty machine hums in the corner of the room. ' +
            'A note taped to it says the door only opens for the right answer.',
          clue:
            'I have keys but no locks. I have space but no room. ' +
            'You can enter, but you can’t go outside. What am I?',
          instructions: 'Type your answer',
          placeholder: 'Enter answer',
          answers: ['keyboard', 'a keyboard', 'the keyboard'],
          hints: [
            'You are probably using one right now.',
            'It has a space bar and an Enter key.'
          ],
          points: 100
        },
        {
          id: 'easy-clock',
          type: 'riddle',
          title: 'The Ticking Wall',
          description:
            'Something on the wall keeps up a steady tick-tock. ' +
            'A note underneath it holds a riddle.',
          clue: 'What has hands but can’t clap?',
          instructions: 'Type your answer',
          placeholder: 'Enter answer',
          answers: ['clock', 'a clock', 'the clock', 'watch', 'a watch',
                    'wristwatch', 'a wristwatch'],
          hints: [
            'It tells you something you are racing against right now.',
            'It hangs on walls and goes tick-tock.'
          ],
          points: 100
        },
        {
          id: 'easy-towel',
          type: 'riddle',
          title: 'The Bathroom Door',
          description:
            'A locked bathroom door has a riddle scratched into it. ' +
            'The answer is something you would find inside.',
          clue: 'What gets wetter the more it dries?',
          instructions: 'Type your answer',
          placeholder: 'Enter answer',
          answers: ['towel', 'a towel', 'the towel', 'bath towel', 'a bath towel'],
          hints: [
            'You use it after a shower.',
            'It hangs on a rail and soaks up water.'
          ],
          points: 100
        },
        {
          id: 'easy-candle',
          type: 'riddle',
          title: 'The Last Light',
          description:
            'A single flame flickers on a table. ' +
            'A card beside it asks one final riddle.',
          clue: 'I’m tall when I’m young and short when I’m old. What am I?',
          instructions: 'Type your answer',
          placeholder: 'Enter answer',
          answers: ['candle', 'a candle', 'the candle'],
          hints: [
            'I give light, and I melt as I burn.',
            'You blow me out on a birthday cake.'
          ],
          points: 100
        }
      ]
    },

    /* ====================================================================
       MEDIUM — 06:00 — logic, interpretation and pattern recognition
       ==================================================================== */
    medium: {
      id: 'medium',
      name: 'Medium',
      description:
        'Moderately challenging riddles requiring logical thinking and pattern recognition.',
      timeLimitSeconds: 6 * 60,
      puzzles: [
        {
          id: 'medium-sequence',
          type: 'pattern',
          title: 'Complete the Sequence',
          description:
            'Glowing numbers appear on the wall, but the last one is missing. ' +
            'The pattern must be completed to open the next door.',
          clue: '2, 6, 12, 20, 30, ?',
          instructions: 'Enter the missing number',
          placeholder: 'Enter number',
          answers: ['42'],
          hints: [
            'Look at the gaps between the numbers: 4, 6, 8, 10 …',
            'The next gap is 12. Add it to 30.'
          ],
          points: 150
        },
        {
          id: 'medium-letters',
          type: 'pattern',
          title: 'The Letter Wall',
          description:
            'Seven letters are painted on the wall in a row. ' +
            'The next one has been scratched out.',
          clue: 'O, T, T, F, F, S, S, ?',
          instructions: 'Enter the missing letter',
          placeholder: 'Enter letter',
          answers: ['e', 'eight'],
          hints: [
            'The letters are not random. Try counting from one.',
            'Each letter is the first letter of a number: One, Two, Three … What comes after Seven?'
          ],
          points: 150
        },
        {
          id: 'medium-sheep',
          type: 'logic',
          title: 'The Sheep Pen',
          description:
            'A farmer’s note is pinned beside the exit. ' +
            'It looks simple, but the exact wording matters.',
          clue: 'A farmer has 17 sheep. All but 9 run away. How many sheep are left?',
          instructions: 'Enter the number',
          placeholder: 'Enter number',
          answers: ['9', 'nine'],
          hints: [
            'Read the sentence slowly. What does “all but 9” mean?',
            'Nine sheep did not run away.'
          ],
          points: 150
        },
        {
          id: 'medium-cipher',
          type: 'cipher',
          title: 'Crack the Cipher',
          description:
            'A scrambled word is carved above the exit. ' +
            'A scratched note explains how it was hidden.',
          clue:
            'Every letter was moved one step forward in the alphabet. ' +
            'The scrambled word is FTDBQF. What was the original word?',
          instructions: 'Enter the original word',
          placeholder: 'Enter word',
          answers: ['escape'],
          hints: [
            'To undo it, move each letter one step back. F becomes E.',
            'The word is what you are trying to do in this game.'
          ],
          points: 150
        },
        {
          id: 'medium-echo',
          type: 'riddle',
          title: 'The Whispering Cave',
          description:
            'A voice seems to answer every sound you make. ' +
            'A note on the wall holds the last riddle.',
          clue:
            'I speak without a mouth and hear without ears. ' +
            'I have no body, but I come alive when you call. What am I?',
          instructions: 'Type your answer',
          placeholder: 'Enter answer',
          answers: ['echo', 'an echo', 'the echo'],
          hints: [
            'You can hear me in canyons and big empty halls.',
            'I repeat whatever you shout.'
          ],
          points: 150
        }
      ]
    },

    /* ====================================================================
       HARD — 08:00 — lateral thinking and multi-step reasoning
       ==================================================================== */
    hard: {
      id: 'hard',
      name: 'Hard',
      description:
        'Challenging riddles requiring lateral thinking and multi-step reasoning.',
      timeLimitSeconds: 8 * 60,
      puzzles: [
        {
          id: 'hard-hands',
          type: 'lateral',
          title: 'The Mirror Drawer',
          description:
            'A mirror hangs above a locked drawer. ' +
            'The inscription below it is a lateral-thinking riddle.',
          clue: 'What can you hold in your right hand, but never in your left hand?',
          instructions: 'Type your answer',
          placeholder: 'Enter answer',
          answers: ['left hand', 'your left hand', 'my left hand', 'the left hand',
                    'left elbow', 'your left elbow', 'my left elbow', 'the left elbow'],
          hints: [
            'The answer is not an object you could pick up and put down.',
            'Look at your own body.'
          ],
          points: 200
        },
        {
          id: 'hard-short',
          type: 'lateral',
          title: 'The Shrinking Word',
          description:
            'A word is carved into the stone. ' +
            'The riddle says it will change when you add to it.',
          clue: 'What five-letter word becomes shorter when you add two letters to it?',
          instructions: 'Enter the word',
          placeholder: 'Enter word',
          answers: ['short'],
          hints: [
            'Think about what the word means, not only how it is spelled.',
            'Try adding “er” to the end of it.'
          ],
          points: 200
        },
        {
          id: 'hard-hotel',
          type: 'lateral',
          title: 'The Hotel Mystery',
          description:
            'A newspaper clipping lies on the floor. ' +
            'It describes a strange case that you must explain.',
          clue:
            'A man pushes his car to a hotel and tells the owner he is bankrupt. Why?',
          instructions: 'Type the one-word answer',
          placeholder: 'Enter answer',
          answers: ['monopoly', 'playing monopoly', 'a game of monopoly',
                    'the game monopoly', 'the board game monopoly',
                    'he is playing monopoly', 'hes playing monopoly'],
          hints: [
            'He is not at a real hotel, and the money is not real either.',
            'Think of a famous board game with cars, hotels and money.'
          ],
          points: 200
        },
        {
          id: 'hard-snail',
          type: 'multi-step',
          title: 'The Deep Well',
          description:
            'A snail is stuck at the bottom of a well. ' +
            'A diagram on the wall shows its slow climb.',
          clue:
            'A snail climbs 3 feet up a 10-foot well each day, then slips ' +
            'back 2 feet each night. On which day does it reach the top?',
          instructions: 'Enter the day number',
          placeholder: 'Enter day',
          answers: ['8', 'day 8', '8th', 'the 8th day', 'eight', 'day eight',
                    'eighth', 'the eighth day'],
          hints: [
            'Each full day and night it gains only 1 foot. But what happens once it reaches the top?',
            'After 7 days it is 7 feet up. What happens on day 8 before night comes?'
          ],
          points: 200
        },
        {
          id: 'hard-safe',
          type: 'multi-step',
          title: 'The Three-Digit Safe',
          description:
            'A heavy safe needs a three-digit combination. ' +
            'A card nearby lists the rules.',
          clue:
            'The tens digit is 5 more than the ones digit. ' +
            'The hundreds digit is 8 less than the tens digit. ' +
            'What is the number?',
          instructions: 'Enter the three-digit number',
          placeholder: 'Enter 3 digits',
          answers: ['194'],
          hints: [
            'A digit can’t be bigger than 9. How large can the tens digit be?',
            'The hundreds digit can’t be 0 in a three-digit number. Try the largest possible tens digit.'
          ],
          points: 200
        }
      ]
    }
  }
};
