import {Note} from './note';
import {Vex} from "./vex";
import {Glyph} from "./glyph";
import {StaveNote} from "./stavenote";
import {Flow} from "./tables";
import {Accidental} from "./accidental";
import {Dot} from "./dot";

export class NumberedNote extends StaveNote {
  /*
{
  "duration" : "n",
  "keys" : "C4",

}
   */

  // eslint-disable-next-line no-useless-constructor

  static get numberedNotationMapping() {
    return {
      "C":
        "1",
      "D":
        "2",
      "E":
        "3",
      "F":
        "4",
      "G":
        "5",
      "A":
        "6",
      "B":
        "7",
    }
  }

  static get numberedDurationLine() {
    return {
      '8': 1,
      '16': 2,
      '32': 3,
      '64': 4,
      '128': 5
    }
  }

  constructor(options) {
    super(options);
    this.setAttribute("type", "NumberedNote")
    this.glyph = null;
    this.line = 0;
    this.text = "C/4";
    this.keys = options.keys || [];
    this.fontSize = 20;
    this.glyph = {
      dot_shiftY : 0
    }
  }

  setKeySignature(key) {
    this.keySignature = key;
  }

  preFormat() {
    this.checkContext();
    if (this.preFormatted) return;
    this.setPreFormatted(true);
    this.setWidth(this.getWidth())
  }

  draw() {
    var key = this.keys[0]
    this.checkContext()
    if (!this.stave) {
      throw new Vex.RERR('NoStave', "Can't draw without a stave.");
    }
    this.setRendered();
    const ctx = this.context;
    let x = this.getAbsoluteX() + (this.tickContext.getMetrics().glyphPx / 2);
    let y;
    y = this.stave.getYForLine(1) + this.stave.options.glyph_spacing_px / 2;
    this.x = x;
    this.y = y;
    let top = this.stave.getYForLine(1) - this.stave.options.glyph_spacing_px / 2
    let topSpace = 4
    var splitted = key.split("/")
    var h = parseInt(splitted[1]);
    var t = h - 3;
    var bd = 0;
    var td = 0;
    if (t < 0) {
      bd = Math.abs(t)
    } else if (h > 0) {
      td = t
    }
    this.number = NumberedNote.numberedNotationMapping[splitted[0].toUpperCase()]
    this.topDots = td;
    this.bottomDots = bd;
    var fontSize = this.stave.options.glyph_spacing_px
    ctx.save()
    ctx.setFont("Arial", fontSize, "normal")
    ctx.openGroup("numberednote")
    if (this.topDots > 0) {
      var startTop = top - topSpace;
      ctx.openGroup("numbernote-head")
      ctx.save()
      for (let i = 0; i < this.topDots; i++) {
        this.drawDOt(ctx, x + (this.stave.options.glyph_spacing_px / 3), startTop, 2)
        startTop -= 6
      }
      ctx.closeGroup()
    }
    ctx.openGroup("numbernote-note")
    ctx.fillText(this.number, x, y)
    ctx.closeGroup()
    if (this.bottomDots > 0) {
      ctx.openGroup("numbernote-bottom")
      var startBottom = y + 2
      for (let i = 0; i < this.bottomDots; i++) {
        this.drawDOt(ctx, startBottom + (this.stave.options.glyph_spacing_px / 3), y, 2)
        startBottom += 6
      }
      ctx.closeGroup()
    }
    ctx.setFont("Arial", 12, "normal")
    for (var i = 0; i < this.modifiers.length; i++) {
      var modifier = this.modifiers[i];
      modifier.reset()
      modifier.setContext(this.context);
      switch(modifier.getAttribute("type")) {
        case 'Dot':
            modifier.y_shift = 8
            modifier.x_shift = 10
            modifier.drawWithStyle()
            break
        case 'Accidental':
          modifier.render_options.font_scale = fontSize * 1.5
          modifier.drawWithStyle();
          break
      }

    }
    ctx.openGroup('numbered_note_lines')
    this.drawDurationLine(ctx)
    ctx.closeGroup()

    ctx.closeGroup()
    this.restoreStyle(ctx);
  }

  getModifierStartXY(position, index) {
    return {
      x: this.x,
      y: this.y - 12
    }
  }

  drawDOt(ctx, x, y, width) {
    ctx.openGroup("numbernote-dot")
    ctx.beginPath()
    ctx.arc(x, y, width, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.closeGroup()
  }

  drawDurationLine(ctx) {
    const duration = Flow.sanitizeDuration(this.duration)
    var lines = NumberedNote.numberedDurationLine[duration.toString()]

    if(lines > 0) {
       const spacing = 4;
       //todo 这里和字体有很大的关系
       var basic = this.stave.options.glyph_spacing_px * 0.8
        var w =  basic + this.getModifierWidth()  + spacing;
        var startX = this.x - this.getModifierWidth() - spacing / 2
        var startY = this.y + 2;
        for(var i = 0;i < lines;i++) {
          console.log(i)
          ctx.rect(startX,startY,w,0.5)
          startY += 3
        }
    }
  }

  getModifierWidth() {
    return 4 * this.modifiers.length
  }

  getWidth() {
    //basic font size + left modifiers width + right modifier width + spacing
    return 20 + 10 + this.getModifierWidth()
  }
}

