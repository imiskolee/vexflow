import {Vex} from "./vex";
import {StaveNote} from "./stavenote";
import {Flow} from "./tables";
import {createCanvas} from "canvas";

let _text_width = null;

export class NumberedNote extends StaveNote {

  static get CATEGORY() {
    return "numberednotes"
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
    this.keys = options.keys || [];
    this.fontSize = 20;
    this.glyph = {
      dot_shiftY : 0
    }
    this.offset_x = 0;
    this.offset_y = 0;
    this.note_tones = [];
    this.duration_lines = 0;
    const duration = Flow.sanitizeDuration(this.duration)
    var lines = NumberedNote.numberedDurationLine[duration.toString()]
    if(lines) {
      this.duration_lines = lines;
    }
    //todo: hack for get text width;
    if(!_text_width) {
      var id = "__$text_wraper$$__"
      let canvas_ele= document.createElement("canvas");
      canvas_ele.id = id;
      document.body.append(canvas_ele)
      const canvas = document.getElementById(id);
      const ctx = canvas.getContext('2d');
      ctx.font_size = 20;
      var text = ctx.measureText("5");
      _text_width = text.width;
      document.body.removeChild(canvas);
    }
  }

  getCategory() {
    return NumberedNote.CATEGORY;
  }

  setKeySignature(key) {
    this.keySignature = key;
  }

  preFormat() {
    this.checkContext();
    if (this.preFormatted) return;
    if (this.modifierContext) this.modifierContext.preFormat();

    this.setWidth(this.full_width)
    console.log("w",this.full_width);
    this.setPreFormatted(true);
  }

  preFormatModifier() {
    this.modifiers.forEach((modifier)=>{
      switch(modifier.getAttribute("type")) {
        case 'Accidental':
          modifier.render_options.font_scale = this.note_width * 1.5
          modifier.y_shift = 1 *this.unit_height;
          modifier.reset()
      }
    })
  }

  draw() {
    this.checkContext()
    if (!this.stave) {
      throw new Vex.RERR('NoStave', "Can't draw without a stave.");
    }
    this.preFormatModifier();
    let ctx = this.context;
    ctx.save()
    ctx.setFont("Arial", this.note_width, "normal")

    ctx.openGroup('note', null, { pointerBBox: true });

    let x = this.getAbsoluteX();
    console.log(this.getAbsoluteX());
   this.x = x;
    let y;
    y = this.stave.getYForLine(1) + this.stave.options.glyph_spacing_px / 2;
    this.y = y;
    this.buildToneHeads();
    this.applyStyle();
    this.note_tones.forEach((head)=>{
      head.draw(ctx);
    });
    ctx.openGroup('modifier', null, { pointerBBox: true });
    this.drawModifiers();
    ctx.closeGroup();
    ctx.closeGroup();
    this.drawDurationLine(ctx,{});
    this.restoreStyle();

    this.setRendered();
  }




  drawDurationLine(ctx,opts) {
    var id = this.attrs.id + '-lines'
    ctx.openGroup('numbered_note_lines',id)
    var startX,startY;
    //todo 分离left modifier 与 right modifier

    if(this.duration_lines > 0) {
      const spacing = this.duration_line_space;
      //todo 这里和字体有很大的关系
      var w = this.full_width + spacing;
      if(opts && opts.width) {
        w = opts.width
      }
      if(!opts || 'undefined' === typeof opts.startX) {
        startX = this.x - spacing / 2 - this.left_width;
      }else{
        startX = opts.startX
      }
      if(!opts || 'undefined' === typeof opts.startY) {
        startY = this.y + this.duration_line_space;
      }else{
        startY = opts.startY
      }
      for(var i = 0;i < this.duration_lines;i++) {
        ctx.rect(startX,startY,w,0.5)
        startY += 3
      }
    }
    ctx.closeGroup()
  }

  removeDurationLines() {
    //todo bug, not work now.
    var id = 'vf-'+this.attrs.id + '-lines'
    var ele =  document.getElementById(id);
    if(ele) {
      ele.remove()
    }
  }

  setStave(stave) {
    super.setStave(stave);
    return this;
  }

  buildToneHeads() {
    this.offset_x = this.x;
    this.offset_y = this.y;
    let ys = [];
    for(let i = 0;i<this.keys.length;i++) {
      const head = new NumberedNoteHead({
        key: this.keys[i],
        x: this.note_x,
        y: this.offset_y,
        idx: i,
        note: this,
      });

      this.offset_y -= (head.height + this.head_space);
      this.note_tones.push(head);
      ys.push(this.offset_y);

    }
    this.setYs(ys);
  }



  get full_width() {
    return this.note_width + this.left_width + this.right_width
  }

  get full_height() {
    return this.bottom_y - this.top_y;
  }

  get note_width() {
    return this.stave.options.glyph_spacing_px
  }

  get note_height() {
    return this.unit_height;
  }
  get unit_height() {
    return this.stave.options.glyph_spacing_px || 0;
  }
  get note_x() {
    return this.x;
  }

  get top_x() {
    return this.x;
  }

  get top_y() {
    var _self = this;
    console.log(Math.sum,_self.note_tones.map((head)=>{
      return (head.td + head.bd) * (_self.dot_space + _self.dot_width)
    }))
    return this.y - ( _self.note_tones.map((head)=>{
      return (head.td + head.bd) * (_self.dot_space + _self.dot_width);
    }).reduce((p,v)=>{return p +v},0) + (this.note_height * this.note_tones.length) - this.unit_height -
      this.note_tones[0].bd * (_self.dot_space + _self.dot_width) + (this.note_tones.length - 1) * this.head_space);
  }

  get bottom_x() {
    return this.x;
  }

  get bottom_y() {
    return this.y +
      this.unit_height + this.duration_lines * (this.duration_line_height + this.duration_line_space)
      + ((this.note_tones[0].meta.bd) * (this.dot_width + this.dot_space))
  }


  get left_width() {
    return this.modifiers_width
  }

  get right_width() {
    return 0;
  }

  get head_space() {
    return 6;
  }

  get duration_line_height() {
    return 2;
  }

  get duration_line_space() {
    return 4;
  }

  get dot_width() {
    return 2;
  }

  get dot_space() {
    return 2;
  }

  getWidth() {
    //basic font size + left modifiers width + right modifier width + spacing
    return this.full_width + 10;
  }

  get modifiers_width() {
    let w = 0;
    this.modifiers.forEach((modifier)=>{
      w += modifier.getWidth();
    })
    return w;
  }
}

class NumberedNoteHead {
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
  tone_to_numbered_key() {
    var spl = this.key.split("/")
    var k = spl[0];
    k = k.replaceAll("#","");
    k = k.replaceAll("b","");
    var h = parseInt(spl[1]);
    var t = h - 4;
    var bd = 0;
    var td = 0;
    if (t < 0) {
      bd = Math.abs(t)
    } else if (h > 0) {
      td = t
    }
    return {
      key: NumberedNoteHead.numberedNotationMapping[k.toUpperCase()],
      td : td,
      bd: bd,
    }
  }

  constructor(options) {
    this.key = options.key;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.idx = options.idx || 0;
    this.note = options.note || 0;
    this.meta = this.tone_to_numbered_key();
    this.td = this.meta.td;
    this.bd = this.meta.bd;
  }

  draw(ctx) {
    let cy = this.y;
    ctx.openGroup("numbered-note-head")
    var basic_x = this.x;
   for(let i =0;i < this.meta.td;i++) {
     this.draw_dot(basic_x + _text_width,cy,note.dot_width);
     cy += (this.note.dot_width + this.note.dot_space);
   }
    ctx.fillText(this.meta.key,basic_x,cy,this.note.note_height);
    cy += this.note.dot_space + this.note.dot_width;
   for(let i = 0; i < this.meta.bd;i++) {

       if(this.idx === 0) {
          let lines_height = (this.note.duration_lines * (this.note.duration_line_height + this.note.duration_line_space))
          cy += lines_height
       }
     this.draw_dot(ctx,basic_x + _text_width ,cy,this.note.dot_width);
     cy += (this.note.dot_width + this.note.dot_space);
   }
   ctx.closeGroup();
  }

  get height() {
    return this.note.note_height + (this.meta.bd + this.meta.td) * (this.note.dot_width + this.note.dot_space);
  }

  draw_dot(ctx, x, y, width) {
    ctx.openGroup("numbered-note-dot")
    ctx.beginPath()
    ctx.arc(x, y, width, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.closeGroup()
  }

}
