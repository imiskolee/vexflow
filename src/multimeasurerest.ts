// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements multiple measure rests

import { defined } from './util';
import { Flow } from './flow';
import { Element } from './element';
import { Glyph } from './glyph';
import { NoteHead } from './notehead';
import { StaveModifierPosition } from './stavemodifier';
import { TimeSignature } from './timesignature';
import { Stave } from './stave';
import { RenderContext } from './types/common';
import { isBarline } from 'typeguard';

export interface MultimeasureRestRenderOptions {
  number_of_measures: number;
  padding_left?: number;
  line?: number;
  number_glyph_point?: number;
  show_number?: boolean;
  line_thickness?: number;
  symbol_spacing?: number;
  serif_thickness?: number;
  use_symbols?: boolean;
  number_line?: number;
  spacing_between_lines_px?: number;
  semibreve_rest_glyph_scale?: number;
  padding_right?: number;
}

let semibreve_rest: {
  glyph_font_scale: number;
  glyph_code: string;
  width: number;
};

function get_semibreve_rest() {
  if (!semibreve_rest) {
    const notehead = new NoteHead({ duration: 'w', note_type: 'r' });
    semibreve_rest = {
      glyph_font_scale: notehead.render_options.glyph_font_scale,
      glyph_code: notehead.glyph_code,
      width: notehead.getWidth(),
    };
  }
  return semibreve_rest;
}

export class MultiMeasureRest extends Element {
  static get CATEGORY(): string {
    return 'MultiMeasureRest';
  }

  protected render_options: MultimeasureRestRenderOptions;
  protected xs: { left: number; right: number };
  protected number_of_measures: number;

  protected stave?: Stave;
  // Parameters:
  // * `number_of_measures` - Number of measures.
  // * `options` - The options object.
  //   * `show_number` - Show number of measures string or not.
  //   * `number_line` -  Staff line to render the number of measures string.
  //   * `number_glyph_point` - Size of the number of measures string glyphs.
  //   * `padding_left` - Left padding from stave x.
  //   * `padding_right` - Right padding from stave end x.
  //   * `line` - Staff line to render rest line or rest symbols.
  //   * `spacing_between_lines_px` - Spacing between staff lines to
  // resolve serif height or {2-bar and 4-bar}rest symbol height.
  //   * `line_thickness` - Rest line thickness.
  //   * `serif_thickness` - Rest serif line thickness.
  //   * `use_symbols` - Use rest symbols or not.
  //   * `symbol_spacing` - Spacing between each rest symbol glyphs.
  //   * `semibreve_rest_glyph_scale` - Size of the semibreve(1-bar) rest symbol.
  constructor(number_of_measures: number, options: MultimeasureRestRenderOptions) {
    super();

    // Any numeric fields in `this.render_options` can be safely be cast "as number" when needed.
    this.render_options = {
      use_symbols: false,
      show_number: true,
      number_line: -0.5,
      number_glyph_point: this.musicFont.lookupMetric('digits.point'), // same as TimeSignature.
      line: 2,
      spacing_between_lines_px: 10, // same as Stave.
      serif_thickness: 2,
      semibreve_rest_glyph_scale: Flow.DEFAULT_NOTATION_FONT_SCALE, // same as NoteHead.
      ...options,
    };

    const fontLineShift = this.musicFont.lookupMetric('digits.shiftLine', 0);
    this.render_options.number_line += fontLineShift;

    this.number_of_measures = number_of_measures;
    this.xs = {
      left: NaN,
      right: NaN,
    };
  }

  getXs(): { left: number; right: number } {
    return this.xs;
  }

  setStave(stave: Stave): this {
    this.stave = stave;
    return this;
  }

  getStave(): Stave | undefined {
    return this.stave;
  }

  checkStave(): Stave {
    return defined(this.stave, 'NoStave', 'No stave attached to instance.');
  }

  drawLine(ctx: RenderContext, left: number, right: number, sbl: number): void {
    const y = this.checkStave().getYForLine(this.render_options.line as number);
    const padding = (right - left) * 0.1;

    left += padding;
    right -= padding;

    const serif = {
      thickness: this.render_options.serif_thickness as number,
      height: sbl,
    };
    let lineThicknessHalf = sbl * 0.25;
    if (this.render_options.line_thickness != undefined) {
      lineThicknessHalf = this.render_options.line_thickness * 0.5;
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(left, y - sbl);
    ctx.lineTo(left + serif.thickness, y - sbl);
    ctx.lineTo(left + serif.thickness, y - lineThicknessHalf);
    ctx.lineTo(right - serif.thickness, y - lineThicknessHalf);
    ctx.lineTo(right - serif.thickness, y - sbl);
    ctx.lineTo(right, y - sbl);
    ctx.lineTo(right, y + sbl);
    ctx.lineTo(right - serif.thickness, y + sbl);
    ctx.lineTo(right - serif.thickness, y + lineThicknessHalf);
    ctx.lineTo(left + serif.thickness, y + lineThicknessHalf);
    ctx.lineTo(left + serif.thickness, y + sbl);
    ctx.lineTo(left, y + sbl);
    ctx.closePath();
    ctx.fill();
  }

  drawSymbols(ctx: RenderContext, left: number, right: number, sbl: number): void {
    const stave = this.checkStave();
    const n4 = Math.floor(this.number_of_measures / 4);
    const n = this.number_of_measures % 4;
    const n2 = Math.floor(n / 2);
    const n1 = n % 2;

    const semibreve_rest = get_semibreve_rest();
    const semibreve_rest_width =
      semibreve_rest.width * (this.render_options.semibreve_rest_glyph_scale / semibreve_rest.glyph_font_scale);
    const glyphs = {
      2: {
        width: semibreve_rest_width * 0.5,
        height: sbl,
      },
      1: {
        width: semibreve_rest_width,
      },
    };

    let spacing = semibreve_rest_width * 1.35;
    if (this.render_options.symbol_spacing != undefined) {
      spacing = this.render_options.symbol_spacing;
    }

    const width = n4 * glyphs[2].width + n2 * glyphs[2].width + n1 * glyphs[1].width + (n4 + n2 + n1 - 1) * spacing;
    let x = left + (right - left) * 0.5 - width * 0.5;

    const line = this.render_options.line as number;
    const yTop = stave.getYForLine(line - 1);
    const yMiddle = stave.getYForLine(line);
    const yBottom = stave.getYForLine(line + 1);

    ctx.save();
    ctx.setStrokeStyle('none');
    ctx.setLineWidth(0);

    for (let i = 0; i < n4; ++i) {
      ctx.fillRect(x, yMiddle - glyphs[2].height, glyphs[2].width, glyphs[2].height);
      ctx.fillRect(x, yBottom - glyphs[2].height, glyphs[2].width, glyphs[2].height);
      x += glyphs[2].width + spacing;
    }
    for (let i = 0; i < n2; ++i) {
      ctx.fillRect(x, yMiddle - glyphs[2].height, glyphs[2].width, glyphs[2].height);
      x += glyphs[2].width + spacing;
    }
    for (let i = 0; i < n1; ++i) {
      Glyph.renderGlyph(ctx, x, yTop, this.render_options.semibreve_rest_glyph_scale, semibreve_rest.glyph_code);
      x += glyphs[1].width + spacing;
    }

    ctx.restore();
  }

  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();

    const stave = this.checkStave();
    const sbl = this.render_options.spacing_between_lines_px as number;

    let left = stave.getNoteStartX();
    let right = stave.getNoteEndX();

    // FIXME: getNoteStartX() returns x+5(barline width) and
    // getNoteEndX() returns x + width(no barline width) by default. how to fix?
    const begModifiers = stave.getModifiers(StaveModifierPosition.BEGIN);

    if (begModifiers.length === 1 && isBarline(begModifiers[0])) {
      left -= begModifiers[0].getWidth();
    }

    if (this.render_options.padding_left != undefined) {
      left = stave.getX() + this.render_options.padding_left;
    }

    if (this.render_options.padding_right != undefined) {
      right = stave.getX() + stave.getWidth() - this.render_options.padding_right;
    }

    this.xs.left = left;
    this.xs.right = right;

    if (this.render_options.use_symbols) {
      this.drawSymbols(ctx, left, right, sbl);
    } else {
      this.drawLine(ctx, left, right, sbl);
    }

    if (this.render_options.show_number) {
      const timeSpec = '/' + this.number_of_measures;
      const timeSig = new TimeSignature(timeSpec, 0, false);
      timeSig.point = this.render_options.number_glyph_point as number;
      timeSig.setTimeSig(timeSpec);
      timeSig.setStave(stave);
      timeSig.setX(left + (right - left) * 0.5 - timeSig.getInfo().glyph.getMetrics().width * 0.5);
      timeSig.bottomLine = this.render_options.number_line as number;
      timeSig.setContext(ctx).draw();
    }
  }
}
