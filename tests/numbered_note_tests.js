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
         space_above_staff_ln:0,
         space_below_staff_ln:0,
         glyph_spacing_px : 16,
         draw_line : false,
       }
      });

      stave.setContext(vf.getContext());
      stave.draw();
      var notes = [
        vf.NumberedNote({ keys: ['C/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['E/3'], duration: '16' }),
        vf.NumberedNote({ keys: ['D/3'], duration: '16' }),
        vf.NumberedNote({ keys: ['C/4'], duration: '16' }),
        vf.NumberedNote({ keys: ['D/4'], duration: '16' }),
        vf.NumberedNote({ keys: ['E/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/4'], duration: '8' }),
      ];
      notes[0].addAccidental(0,new VF.Accidental('#'));
      notes[1].addAccidental(0,new VF.Accidental('b'));
      //notes[2].addAccidental(0,new VF.Accidental('##'));
     // notes[3].addAccidental(0,new VF.Accidental('bb'));
      const beams = Vex.Flow.Beam.generateBeams(notes,{
        stem_direction: -1,
        maintain_stem_directions: true,
        beam_rests: true,
        beam_middle_only: true,
        is_numbered_note: true,
        groups: [new Vex.Flow.Fraction(2, 8),new Vex.Flow.Fraction(4, 16)]
      });
      //notes[0].addDot(0);
      for (let i = 0; i < notes.length; i++) {
        var note = notes[i];
        new VF.TickContext()
          .addTickable(note)
          .preFormat()
          .setX(i * 25);

        note.setContext(vf.getContext()).draw();
      }
      beams.forEach((beam)=>{
        beam.setContext(vf.getContext()).draw();
      });
      {
        var curve1 = new Vex.Flow.Curve(notes[0], notes[1], {
          spacing: 1,
          invert: true,

        });
        curve1.setContext(vf.getContext());
        curve1.draw();
      }
      {
        var curve1 = new Vex.Flow.Curve(notes[2], notes[5], {
          spacing: 1,
          invert: true,
        });
        curve1.setContext(vf.getContext());
        curve1.draw();
      }
      vf.draw();
      ok(true);
    }
  };
  return NumberedNote;
})();
