// VexFlow - Music Engraving for HTML5
//
// A base class for stave modifiers (e.g. clefs, key signatures)
//

/**
 * @constructor
 */
export class StaveModifier {
  constructor() {
    this.padding = 10;
    this.position = StaveModifier.Position.ABOVE;
  }

  static get Position() {
    return {
      LEFT: 1,
      RIGHT: 2,
      ABOVE: 3,
      BELOW: 4,
      BEGIN: 5,
      END: 6
    };
  }
  getPosition() { return this.position; }
  setPosition(position) { this.position = position; return this; }
  getStave() { return this.stave; }
  setStave(stave) { this.stave = stave; return this; }
  getWidth() { return this.width; }
  setWidth(width) { this.width = width; return this; }
  getX() { return this.x; }
  setX(x) { this.x = x; return this; }
  getCategory() {return "";}
  makeSpacer(padding) {
    return {
      getContext() { return true; },
      setStave() {},
      renderToStave() {},
      getMetrics() {
        return { width: padding };
      }
    };
  }
  placeGlyphOnLine(glyph, stave, line) {
    glyph.setYShift(stave.getYForLine(line) - stave.getYForGlyphs());
  }
  getPadding(index) {
    return (index !== undefined && index < 2 ? 0 : this.padding);
  }
  setPadding(padding) { this.padding = padding; return this; }
}
