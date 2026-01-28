export type Dimensions = {
  height: number;
  width: number;
};

export type Point = {
  x: number;
  y: number;
};

export type PointerPrecision = {
  coarse: number;
  precise: number;
};

export class Rect extends DOMRectReadOnly {
  toString() {
    return Rect.print(this);
  }

  static fromObject({
    x,
    y,
    width,
    height
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): Rect {
    return new Rect(x, y, width, height);
  }

  static merge(source: DOMRect, target: Partial<DOMRect>): Rect {
    return Rect.fromObject({
      x: target.x ?? source.x,
      y: target.y ?? source.y,
      width: target.width ?? source.width,
      height: target.height ?? source.height
    });
  }

  static print(rect: DOMRect) {
    return `${rect.x}, ${rect.y} ${rect.width} x ${rect.height}`;
  }
}
