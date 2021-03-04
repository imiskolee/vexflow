
VF.Test.NumberedNote = (function() {
  var NumberedNote = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module('NumberedNote');
      runTests('NumberedNote Formatting', NumberedNote.formatNumberedNotes);
    },
    formatNumberedNotes: function(options) {
      var vf = VF.Test.makeFactory(options, 1024, 400);
      var stave = vf.Stave({ y: 200,
       options : {
          num_lines : 3,
         space_above_staff_ln:0,
         space_below_staff_ln:0,
         glyph_spacing_px : 16,
         draw_line : false,
       }
      },1024);
      stave.setContext(vf.getContext());
      stave.draw();
      var notes = [
        vf.NumberedNote({ keys: ['C/2'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/2'], duration: '8' }),
        vf.NumberedNote({ keys: ['C/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['E/3'], duration: '16' }),
        vf.NumberedNote({ keys: ['D/3'], duration: '16' }),
        vf.NumberedNote({ keys: ['C/4'], duration: '16' }),
        vf.NumberedNote({ keys: ['D/4'], duration: '16' }),
        vf.NumberedNote({ keys: ['E/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['A/5'], duration: '8' }),
        vf.NumberedNote({ keys: ['B/5'], duration: '8' }),
        vf.NumberedNote({ keys: ['C/3', 'E/3', 'G/3'], duration: '4' }),
        vf.NumberedNote({ keys: ['C/3', 'E/3', 'G/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['C/3', 'E/3', 'G/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['F/3', 'A/3', 'C/4','E/4'], duration: '2' }),
        vf.NumberedNote({ keys: ['F/3', 'A/3', 'C/4','E/4'], duration: '2' }),
        vf.NumberedNote({ keys: ['F/3', 'A/3', 'C/4','E/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['F/3', 'A/3', 'C/4','E/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['C/5'], duration: '2' }),
        vf.NumberedNote({ keys: ['B/5'], duration: '1' }),
      ];
      notes[1].addDot(0);
      notes[1].addDot(0);
      notes[1].addDot(0);

      notes[0].addAccidental(0, new VF.Accidental('#'));
      notes[1].addAccidental(0, new VF.Accidental('b'));

      notes[12].addAccidental(0, new VF.Accidental('#'));
      notes[12].addAccidental(1, new VF.Accidental('b'));
      notes[12].addAccidental(2, new VF.Accidental('b'));
      notes[13].addAccidental(0, new VF.Accidental('#'));
      notes[13].addAccidental(1, new VF.Accidental('bb'));
      notes[13].addAccidental(2, new VF.Accidental('##'));

      notes[13].addStroke(0, new VF.Stroke(VF.Stroke.Type.RASQUEDO_DOWN));
      notes[17].addStroke(0, new VF.Stroke(VF.Stroke.Type.RASQUEDO_DOWN));
      notes[18].addStroke(0, new VF.Stroke(VF.Stroke.Type.RASQUEDO_UP));

      console.log(notes[0].getFullHeight());



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
      let offset = 0;
      for (let i = 0; i < notes.length; i++) {
        var note = notes[i];
        note.setModifierContext(new VF.ModifierContext());
        var width = note.full_width + 20;
        new VF.TickContext()
          .addTickable(note)
          .preFormat()
          .setX(offset + note.left_width);
           offset += width;
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
      {
        var curve1 = new Vex.Flow.Curve(notes[8], notes[12], {
          spacing: 1,
          invert: true,
        });
        curve1.setContext(vf.getContext());
        curve1.draw();
      }
      vf.draw();
      console.log(notes)
      ok(true);

    }


  };
  return NumberedNote;
})();
