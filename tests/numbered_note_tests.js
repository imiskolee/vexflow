VF.Test.NumberedNote = (function() {
  var NumberedNote = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module('NumberedNote');
      runTests('NumberedNote Formatting', NumberedNote.formatNumberedNotes);
    },
    formatNumberedNotes: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();
      var voice = score.voice([
        vf.NumberedNote({ keys: ['C/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['E/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/3'], duration: '8' }),
        vf.NumberedNote({ keys: ['C/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['E/4'], duration: '8' }),
        vf.NumberedNote({ keys: ['D/4'], duration: '8' }),
      ]);
      voice.setContext(vf.getContext()).setStave(stave).draw();
      vf.draw();
      ok(true);
    }
  };
  return NumberedNote;
})();
