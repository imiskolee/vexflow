import {Note} from './note';
import {Vex} from "./vex";
import {Glyph} from "./glyph";
import {StaveNote} from "./stavenote";
import {Flow} from "./tables";
import {Accidental} from "./accidental";
import {Dot} from "./dot";

export class NumberedNote extends StaveNote {
  static get CATEGORY() {
    return "numberednotes"
  }
  getCategory() { return NumberedNote.CATEGORY; }
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

  static get dotWidth() {
    return 2;
  }
  static get bottomSpace() {
    return 4;
  }
   get noteHeight() {
     var fontSize =this.stave.options.glyph_spacing_px;
    // fontSize = fontSize - fontSize / this.keys.length;
     return fontSize
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
    if (this.modifierContext) this.modifierContext.preFormat();

    this.setWidth(this.getWidth())
    this.setPreFormatted(true);
  }

  tone_to_numbered_key(key) {
    var splitted = key.split("/")
    var k = splitted[0]
    k = k.replaceAll("#","");
    k = k.replaceAll("b","");
    var h = parseInt(splitted[1]);
    var t = h - 4;
    var bd = 0;
    var td = 0;
    if (t < 0) {
      bd = Math.abs(t)
    } else if (h > 0) {
      td = t
    }
    return {
      key: NumberedNote.numberedNotationMapping[k.toUpperCase()],
      td : td,
      bd: bd,
    }
  }



  draw() {
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

    const fontSize = this.noteHeight

    const duration = Flow.sanitizeDuration(this.duration)
    var lines = NumberedNote.numberedDurationLine[duration.toString()]
    if(!lines) {
      lines = 0;
    }

    for(var i=0;i<this.keys.length;i++) {
      //this.y = y;
      var _h = fontSize;
      let k = this.keys[i].toUpperCase();
      var meta = this.tone_to_numbered_key(k);
      ctx.save()
      ctx.setFont("Arial", fontSize, "normal")

      ctx.openGroup("numberednote",this.attrs.id)
      if (meta.td > 0) {
        _h += topSpace;
        var startTop = top - topSpace;
        ctx.openGroup("numbernote-head")
        ctx.save()
        for (let i = 0; i < meta.td; i++) {
          this.drawDOt(ctx, x + (this.stave.options.glyph_spacing_px / 3), startTop, NumberedNote.dotWidth)
          startTop -= 6
          _h += 6;
        }
        ctx.closeGroup()
      }
      ctx.openGroup("numbernote-note")
      ctx.fillText(meta.key, x, y)
      ctx.closeGroup()
      if (meta.bd> 0) {
        ctx.openGroup("numbernote-bottom")
        var startBottom = y + (4 * lines)
        _h += 4 * lines
        for (let i = 0; i < meta.bd; i++) {
         this.drawDOt(ctx, x + (this.stave.options.glyph_spacing_px / 3),startBottom, NumberedNote.dotWidth)
          startBottom += 6
          _h += 6
        }
        ctx.closeGroup()
      }
      y -= _h;
    }

    ctx.setFont("Arial", 12, "normal");
    for (var i = 0; i < this.modifiers.length; i++) {
      var modifier = this.modifiers[i];
      modifier.reset()
      modifier.setContext(this.context);

      switch(modifier.getAttribute("type")) {
        case 'Dot':
            modifier.drawWithStyle()
            break
        case 'Accidental':
          modifier.render_options.font_scale = fontSize * 1.5
          modifier.reset()
          modifier.drawWithStyle();
          break
      }

    }

    this.drawDurationLine(ctx)


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
  removeDurationLines() {
    var id = 'vf-'+this.attrs.id + '-lines'
    var ele =  document.getElementById(id);
    if(ele) {
      ele.remove()
    }
  }
  drawDurationLine(ctx,opts) {
    var id = this.attrs.id + '-lines'
    ctx.openGroup('numbered_note_lines',id)
    var startX,startY;
    //todo 分离left modifier 与 right modifier
    const duration = Flow.sanitizeDuration(this.duration)
    var lines = NumberedNote.numberedDurationLine[duration.toString()]

    if(lines > 0) {
       const spacing = 4;
       //todo 这里和字体有很大的关系
       var basic = this.stave.options.glyph_spacing_px * 0.8
        var w =  basic + this.getModifierWidth()  + spacing;
       if(opts && opts.width) {
          w = opts.width
       }
       if(!opts || 'undefined' === typeof opts.startX) {
          startX = this.x - this.getModifierWidth() - spacing / 2
       }else{
         startX = opts.startX
       }
      if(!opts || 'undefined' === typeof opts.startY) {
         startY = this.y + 2;
      }else{
          startY = opts.startY
      }
      for(var i = 0;i < lines;i++) {
        ctx.rect(startX,startY,w,0.5)
        startY += 3
        }
    }
    ctx.closeGroup()
  }

  getModifierWidth() {
    return 4 * this.modifiers.length
  }

  getWidth() {
    //basic font size + left modifiers width + right modifier width + spacing
    return 20 + 10 + this.getModifierWidth()
  }

  getHeight() {
    var noteHeight = (this.noteHeight) * this.keys.length ;
    let metas = [];
    this.keys.forEach((v)=>{
      metas.push(this.tone_to_numbered_key(v));
    })
    var dots = 0;
    metas.forEach((meta)=>{
      dots += meta.td;
      dots += meta.bd;
    })
    noteHeight += (NumberedNote.dotWidth + 6) * dots;
    return noteHeight
  }

  getTopY() {
    return this.y - this.getHeight() + this.stave.options.glyph_spacing_px;
  }

}

