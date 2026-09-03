export function ensureNodeDomMatrix(): void {
  const globalScope = globalThis as typeof globalThis & {
    DOMMatrix?: unknown;
    DOMMatrixReadOnly?: unknown;
    ImageData?: unknown;
  };
  if (typeof globalScope.DOMMatrix === "function") {
    try {
      const probe = new (globalScope.DOMMatrix as new () => { a?: number })();
      if (typeof probe.a === "number") {
        if (typeof globalScope.DOMMatrixReadOnly !== "function") {
          globalScope.DOMMatrixReadOnly = globalScope.DOMMatrix;
        }
        return;
      }
    } catch {
      // Replace incomplete serverless stubs.
    }
  }

  class DOMMatrixPolyfill {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    m11 = 1;
    m12 = 0;
    m13 = 0;
    m14 = 0;
    m21 = 0;
    m22 = 1;
    m23 = 0;
    m24 = 0;
    m31 = 0;
    m32 = 0;
    m33 = 1;
    m34 = 0;
    m41 = 0;
    m42 = 0;
    m43 = 0;
    m44 = 1;
    is2D = true;
    isIdentity = true;

    constructor(init?: number[] | string) {
      if (Array.isArray(init) && init.length >= 6) {
        this.a = Number(init[0] ?? 1);
        this.b = Number(init[1] ?? 0);
        this.c = Number(init[2] ?? 0);
        this.d = Number(init[3] ?? 1);
        this.e = Number(init[4] ?? 0);
        this.f = Number(init[5] ?? 0);
        this.m11 = this.a;
        this.m12 = this.b;
        this.m21 = this.c;
        this.m22 = this.d;
        this.m41 = this.e;
        this.m42 = this.f;
      }
    }

    multiplySelf(other: DOMMatrixPolyfill) {
      const a = this.a * other.a + this.c * other.b;
      const b = this.b * other.a + this.d * other.b;
      const c = this.a * other.c + this.c * other.d;
      const d = this.b * other.c + this.d * other.d;
      const e = this.a * other.e + this.c * other.f + this.e;
      const f = this.b * other.e + this.d * other.f + this.f;
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.e = e;
      this.f = f;
      this.m11 = a;
      this.m12 = b;
      this.m21 = c;
      this.m22 = d;
      this.m41 = e;
      this.m42 = f;
      this.isIdentity = a === 1 && b === 0 && c === 0 && d === 1 && e === 0 && f === 0;
      return this;
    }

    preMultiplySelf(other: DOMMatrixPolyfill) {
      return new DOMMatrixPolyfill([other.a, other.b, other.c, other.d, other.e, other.f]).multiplySelf(this);
    }

    translateSelf(tx = 0, ty = 0) {
      this.e += tx * this.a + ty * this.c;
      this.f += tx * this.b + ty * this.d;
      this.m41 = this.e;
      this.m42 = this.f;
      this.isIdentity = false;
      return this;
    }

    scaleSelf(sx = 1, sy = sx) {
      this.a *= sx;
      this.b *= sx;
      this.c *= sy;
      this.d *= sy;
      this.m11 = this.a;
      this.m12 = this.b;
      this.m21 = this.c;
      this.m22 = this.d;
      this.isIdentity = false;
      return this;
    }

    inverse() {
      const det = this.a * this.d - this.b * this.c;
      const out = new DOMMatrixPolyfill();
      if (!det) return out;
      out.a = this.d / det;
      out.b = -this.b / det;
      out.c = -this.c / det;
      out.d = this.a / det;
      out.e = (this.c * this.f - this.d * this.e) / det;
      out.f = (this.b * this.e - this.a * this.f) / det;
      out.m11 = out.a;
      out.m12 = out.b;
      out.m21 = out.c;
      out.m22 = out.d;
      out.m41 = out.e;
      out.m42 = out.f;
      return out;
    }

    invertSelf() {
      const inverted = this.inverse();
      this.a = inverted.a;
      this.b = inverted.b;
      this.c = inverted.c;
      this.d = inverted.d;
      this.e = inverted.e;
      this.f = inverted.f;
      this.m11 = inverted.a;
      this.m12 = inverted.b;
      this.m21 = inverted.c;
      this.m22 = inverted.d;
      this.m41 = inverted.e;
      this.m42 = inverted.f;
      return this;
    }

    multiply(other: DOMMatrixPolyfill) {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).multiplySelf(other);
    }

    translate(tx?: number, ty?: number) {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).translateSelf(tx, ty);
    }

    scale(sx?: number, sy?: number) {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).scaleSelf(sx, sy);
    }

    transformPoint(point: { x?: number; y?: number }) {
      const x = Number(point.x ?? 0);
      const y = Number(point.y ?? 0);
      return {
        x: this.a * x + this.c * y + this.e,
        y: this.b * x + this.d * y + this.f,
        z: 0,
        w: 1,
      };
    }
  }

  globalScope.DOMMatrix = DOMMatrixPolyfill;
  globalScope.DOMMatrixReadOnly = DOMMatrixPolyfill;
  if (typeof globalScope.ImageData !== "function") {
    globalScope.ImageData = class ImageDataPolyfill {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(data: Uint8ClampedArray | number, width?: number, height?: number) {
        if (typeof data === "number") {
          this.width = data;
          this.height = Number(width ?? 0);
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        } else {
          this.data = data;
          this.width = Number(width ?? 0);
          this.height = Number(height ?? 0);
        }
      }
    };
  }
}
