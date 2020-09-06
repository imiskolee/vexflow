VF.Test.NumberedNote = (function() {
  var NumberedNote = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module('NumberedNote');
      runTests('NumberedNote Formatting', NumberedNote.formatNumberedNotes);
    },
    formatNumberedNotes: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40,
       options : {
          num_lines : 3,
         glyph_spacing_px : 16,
         draw_line : false,
       }
      });
      stave.setContext(vf.getContext());
      stave.draw();
      var notes = [
        vf.NumberedNote({ keys: ['C/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['E/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['C/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['E/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/4'], duration: '8' }),
      ];
      for (let i = 0; i < notes.length; i++) {
        var note = notes[i];
        new VF.TickContext()
          .addTickable(note)
          .preFormat()
          .setX(i * 25);

        note.setContext(vf.getContext()).draw();
      }
      vf.draw();
      ok(true);
    }
  };
  return NumberedNote;
})();
