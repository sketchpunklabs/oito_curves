import { vec3, Maths } from "oito";
class BezierCubic {
  static at(a, b, c, d, t, out) {
    const i = 1 - t, ii = i * i, iii = ii * i, tt = t * t, ttt = tt * t, iit3 = 3 * ii * t, itt3 = 3 * i * tt;
    out != null ? out : out = [0, 0, 0];
    out[0] = iii * a[0] + iit3 * b[0] + itt3 * c[0] + ttt * d[0];
    out[1] = iii * a[1] + iit3 * b[1] + itt3 * c[1] + ttt * d[1];
    out[2] = iii * a[2] + iit3 * b[2] + itt3 * c[2] + ttt * d[2];
    return out;
  }
  static dxdy(a, b, c, d, t, out) {
    if (t > 1)
      t = 1;
    else if (t < 0)
      t = 0;
    const i = 1 - t, ii3 = 3 * i * i, it6 = 6 * i * t, tt3 = 3 * t * t;
    out != null ? out : out = [0, 0, 0];
    out[0] = ii3 * (b[0] - a[0]) + it6 * (c[0] - b[0]) + tt3 * (d[0] - c[0]);
    out[1] = ii3 * (b[1] - a[1]) + it6 * (c[1] - b[1]) + tt3 * (d[1] - c[1]);
    out[2] = ii3 * (b[2] - a[2]) + it6 * (c[2] - b[2]) + tt3 * (d[2] - c[2]);
    return out;
  }
  static dxdy2(a, b, c, d, t, out) {
    if (t > 1)
      t = 1;
    else if (t < 0)
      t = 0;
    const t6 = 6 * t;
    out != null ? out : out = [0, 0, 0];
    out[0] = t6 * (d[0] + 3 * (b[0] - c[0]) - a[0]) + 6 * (a[0] - 2 * b[0] + c[0]);
    out[1] = t6 * (d[1] + 3 * (b[1] - c[1]) - a[1]) + 6 * (a[1] - 2 * b[1] + c[1]);
    out[2] = t6 * (d[2] + 3 * (b[2] - c[2]) - a[2]) + 6 * (a[2] - 2 * b[2] + c[2]);
    return out;
  }
}
class BezierQuad {
  static at(a, b, c, t, out) {
    out != null ? out : out = [0, 0, 0];
    const s = 1 - t;
    out[0] = s * (s * a[0] + t * b[0]) + t * (s * b[0] + t * c[0]);
    out[1] = s * (s * a[1] + t * b[1]) + t * (s * b[1] + t * c[1]);
    out[2] = s * (s * a[2] + t * b[2]) + t * (s * b[2] + t * c[2]);
    return out;
  }
  static dxdy(a, b, c, t, out) {
    out != null ? out : out = [0, 0, 0];
    const s2 = 2 * (1 - t);
    const t2 = 2 * t;
    out[0] = s2 * (b[0] - a[0]) + t2 * (c[0] - b[0]);
    out[1] = s2 * (b[1] - a[1]) + t2 * (c[1] - b[1]);
    out[2] = s2 * (b[2] - a[2]) + t2 * (c[2] - b[2]);
    return out;
  }
  static dxdy2(a, b, c, t, out) {
    out != null ? out : out = [0, 0, 0];
    out[0] = -4 * b[0] + 2 * a[0] + 2 * c[0];
    out[1] = -4 * b[1] + 2 * a[1] + 2 * c[1];
    out[2] = -4 * b[2] + 2 * a[2] + 2 * c[2];
    return out;
  }
}
class Point {
  constructor(pos) {
    this.pos = [0, 0, 0];
    this.attrib = {};
    vec3.copy(pos, this.pos);
  }
}
class Spline {
  constructor() {
    this.points = [];
    this._curveCnt = 0;
    this._pointCnt = 0;
    this._isLoop = false;
  }
  set isLoop(b) {
    this._isLoop = b;
  }
  get isLoop() {
    return this._isLoop;
  }
  get curveCount() {
    return this._curveCnt;
  }
  get pointCount() {
    return this._pointCnt;
  }
  add(pos) {
    this.points.push(new Point(pos));
    this._pointCnt = this.points.length;
    return this;
  }
  setPos(idx, pos) {
    vec3.copy(pos, this.points[idx].pos);
    return this;
  }
  at(t, pos) {
    return pos || [0, 0, 0];
  }
}
class BezierQuadSpline extends Spline {
  add(pos) {
    super.add(pos);
    this._curveCnt = Math.max(0, Math.floor((this._pointCnt - 1) / 2));
    return this;
  }
  get curveCount() {
    return !this._isLoop ? this._curveCnt : this._curveCnt + 1;
  }
  at(t, pos, dxdy, dxdy2) {
    if (t > 1)
      t = 1;
    else if (t < 0)
      t = 0;
    const p = this.points;
    const [a, b, c, tt] = !this._isLoop ? this._computeCurveIdx(t) : this._computeLoopIdx(t);
    if (pos)
      BezierQuad.at(p[a].pos, p[b].pos, p[c].pos, tt, pos);
    if (dxdy)
      BezierQuad.dxdy(p[a].pos, p[b].pos, p[c].pos, tt, dxdy);
    if (dxdy2)
      BezierQuad.dxdy2(p[a].pos, p[b].pos, p[c].pos, tt, dxdy2);
  }
  atCurve(cIdx, t, pos, dxdy, dxdy2) {
    if (t > 1)
      t = 1;
    else if (t < 0)
      t = 0;
    const p = this.points;
    const a = cIdx * 2;
    const b = Maths.mod(a + 1, this._pointCnt);
    const c = Maths.mod(a + 2, this._pointCnt);
    if (pos)
      BezierQuad.at(p[a].pos, p[b].pos, p[c].pos, t, pos);
    if (dxdy)
      BezierQuad.dxdy(p[a].pos, p[b].pos, p[c].pos, t, dxdy);
    if (dxdy2)
      BezierQuad.dxdy2(p[a].pos, p[b].pos, p[c].pos, t, dxdy2);
  }
  _computeCurveIdx(t) {
    let i, tt;
    if (t != 1) {
      tt = t * this._curveCnt;
      i = tt | 0;
      tt -= i;
      i *= 2;
    } else {
      i = (this._curveCnt - 1) * 2;
      tt = 1;
    }
    return [i, i + 1, i + 2, tt];
  }
  _computeLoopIdx(t) {
    let i, tt;
    if (t != 1) {
      tt = t * (this._curveCnt + 1);
      i = tt | 0;
      tt -= i;
      i *= 2;
    } else {
      i = this._pointCnt - 2;
      tt = 1;
    }
    return [i, Maths.mod(i + 1, this._pointCnt), Maths.mod(i + 2, this._pointCnt), tt];
  }
}
class Hermite {
  static at(a, b, c, d, t, tension, bias, out) {
    const t2 = t * t, t3 = t2 * t, a0 = 2 * t3 - 3 * t2 + 1, a1 = t3 - 2 * t2 + t, a2 = t3 - t2, a3 = -2 * t3 + 3 * t2;
    const ten_bias_n = (1 - bias) * (1 - tension) * 0.5;
    const ten_bias_p = (1 + bias) * (1 - tension) * 0.5;
    out != null ? out : out = [0, 0, 0];
    out[0] = a0 * b[0] + a1 * ((b[0] - a[0]) * ten_bias_p + (c[0] - b[0]) * ten_bias_n) + a2 * ((c[0] - b[0]) * ten_bias_p + (d[0] - c[0]) * ten_bias_n) + a3 * c[0];
    out[1] = a0 * b[1] + a1 * ((b[1] - a[1]) * ten_bias_p + (c[1] - b[1]) * ten_bias_n) + a2 * ((c[1] - b[1]) * ten_bias_p + (d[1] - c[1]) * ten_bias_n) + a3 * c[1];
    out[2] = a0 * b[2] + a1 * ((b[2] - a[2]) * ten_bias_p + (c[2] - b[2]) * ten_bias_n) + a2 * ((c[2] - b[2]) * ten_bias_p + (d[2] - c[2]) * ten_bias_n) + a3 * c[2];
    return out;
  }
  static dxdy(a, b, c, d, t, tension, bias, out) {
    const tt = t * t, tt6 = 6 * tt, tt3 = 3 * tt, a0 = tt6 - 6 * t, a1 = tt3 - 4 * t + 1, a2 = tt3 - 2 * t, a3 = 6 * t - tt6;
    const ten_bias_n = (1 - bias) * (1 - tension) * 0.5;
    const ten_bias_p = (1 + bias) * (1 - tension) * 0.5;
    out != null ? out : out = [0, 0, 0];
    out[0] = a0 * b[0] + a1 * ((b[0] - a[0]) * ten_bias_p + (c[0] - b[0]) * ten_bias_n) + a2 * ((c[0] - b[0]) * ten_bias_p + (d[0] - c[0]) * ten_bias_n) + a3 * c[0];
    out[1] = a0 * b[1] + a1 * ((b[1] - a[1]) * ten_bias_p + (c[1] - b[1]) * ten_bias_n) + a2 * ((c[1] - b[1]) * ten_bias_p + (d[1] - c[1]) * ten_bias_n) + a3 * c[1];
    out[2] = a0 * b[2] + a1 * ((b[2] - a[2]) * ten_bias_p + (c[2] - b[2]) * ten_bias_n) + a2 * ((c[2] - b[2]) * ten_bias_p + (d[2] - c[2]) * ten_bias_n) + a3 * c[2];
    return out;
  }
}
export { BezierCubic, BezierQuad, BezierQuadSpline, Hermite };
