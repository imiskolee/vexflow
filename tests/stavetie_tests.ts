/**
 * VexFlow - StaveTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
const StaveTieTests = (function () {
  function createTest(notesData, setupTies) {
    return function (options) {
      const f = VexFlowTests.makeFactory(options, 300);
      const stave = f.Stave();
      const score = f.EasyScore();
      const voice = score.voice(score.notes.apply(score, notesData));
      const notes = voice.getTickables();

      setupTies(f, notes, stave);

      f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      f.draw();

      ok(true);
    };
  }

  return {
    Start: function () {
      const run = VexFlowTests.runTests;

      QUnit.module('StaveTie');

      run(
        'Simple StaveTie',
        createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], function (vf, notes) {
          vf.StaveTie({
            from: notes[0],
            to: notes[1],
            first_indices: [0, 1],
            last_indices: [0, 1],
          });
        })
      );

      run(
        'Chord StaveTie',
        createTest(['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'down' }], function (vf, notes) {
          vf.StaveTie({
            from: notes[0],
            to: notes[1],
            first_indices: [0, 1, 2],
            last_indices: [0, 1, 2],
          });
        })
      );

      run(
        'Stem Up StaveTie',
        createTest(['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'up' }], function (vf, notes) {
          vf.StaveTie({
            from: notes[0],
            to: notes[1],
            first_indices: [0, 1, 2],
            last_indices: [0, 1, 2],
          });
        })
      );

      run(
        'No End Note',
        createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], function (vf, notes, stave) {
          stave.addEndClef('treble');
          vf.StaveTie({
            from: notes[1],
            to: null,
            first_indices: [2],
            last_indices: [2],
            text: 'slow.',
          });
        })
      );

      run(
        'No Start Note',
        createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], function (vf, notes, stave) {
          stave.addClef('treble');
          vf.StaveTie({
            from: null,
            to: notes[0],
            first_indices: [2],
            last_indices: [2],
            text: 'H',
          });
        })
      );

      run(
        'Set Direction Down',
        createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], function (vf, notes) {
          vf.StaveTie({
            from: notes[0],
            to: notes[1],
            first_indices: [0, 1],
            last_indices: [0, 1],
            options: {
              direction: VF.Stem.DOWN,
            },
          });
        })
      );

      run(
        'Set Direction Up',
        createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], function (vf, notes) {
          vf.StaveTie({
            from: notes[0],
            to: notes[1],
            first_indices: [0, 1],
            last_indices: [0, 1],
            options: {
              direction: VF.Stem.UP,
            },
          });
        })
      );
    },
  };
})();
VexFlowTests.StaveTie = StaveTieTests;
export { StaveTieTests };
