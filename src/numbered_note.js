import {Note} from './note';
import {Vex} from "./vex";
import {Glyph} from "./glyph";
import {StaveNote} from "./stavenote";

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

  constructor(options) {
    super(options);
    this.setAttribute("type", "NumberedNote")
    this.glyph = null;
    this.line = 0;
    this.text = "C/4";
    this.keys = options.keys || [];
  }

  setKeySignature(key) {
    this.keySignature = key;
  }
  preFormat() {
    this.checkContext();
    if (this.preFormatted) return;
    this.setPreFormatted(true);

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
    ctx.setFont("Arial",fontSize,"normal")
    ctx.openGroup("numberednote")
    if (this.topDots > 0) {
      var startTop = top - topSpace;
      ctx.openGroup("numbernote-head")
      ctx.save()
      for (let i = 0; i < this.topDots; i++) {
        this.drawDOt(ctx,x +(this.stave.options.glyph_spacing_px / 3),startTop,2)
        startTop -= 6
      }
      ctx.closeGroup()
    }
    ctx.openGroup("numbernote-note")
    ctx.fillText(this.number,x,y)
    ctx.closeGroup()
    if (this.bottomDots > 0) {
      ctx.openGroup("numbernote-bottom")
      var startBottom = y + 2
      for (let i = 0; i < this.bottomDots; i++) {
        this.drawDOt(ctx,startBottom +(this.stave.options.glyph_spacing_px / 3),y,2)
        startBottom += 6
      }
      ctx.closeGroup()
    }

    console.log(this.modifiers,this)
    ctx.setFont("Arial",12,"normal")
    for(var i=0;i<this.modifiers.length; i++) {
      var modifier = this.modifiers[i];
      modifier.render_options.font_scale = fontSize * 1.5
      modifier.reset()
      modifier.setContext(this.context);
      modifier.drawWithStyle();
    }
    ctx.closeGroup()
    this.restoreStyle(ctx);
  }

  drawNote() {

  }

  getModifierStartXY(position,index) {
    console.log(this.context)
    return {
      x:this.x,
      y : this.y - 12
    }
  }

  drawDOt(ctx,x,y,width) {
    ctx.openGroup("numbernote-dot")
    ctx.beginPath()
    ctx.arc(x,y,width,0,2*Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.closeGroup()
  }



  getWidth() {
    return 40
  }
}

