/* The mathematical model is independent of the interface and rendering. */
(function (root) {
  'use strict';
  const A = Math.sqrt(5), B = 2, EPS = 1e-9;
  const dot = (p, q) => p.x * q.x + p.y * q.y;
  const det = (p, q) => p.x * q.y - p.y * q.x;
  const scale = (p, x, y) => ({ x: p.x * x, y: p.y * y });
  function geometry(thetaDegrees, rho) {
    const theta = thetaDegrees * Math.PI / 180;
    const rhoSafe = Math.max(-1, Math.min(1, rho));
    const normalLength = Math.hypot(A * Math.sin(theta), B * Math.cos(theta));
    const n = { x: -A * Math.sin(theta) / normalLength, y: B * Math.cos(theta) / normalLength };
    const tangent = { x: -n.y, y: n.x };
    const half = Math.sqrt(Math.max(0, 1 - rhoSafe * rhoSafe));
    const m = { x: rhoSafe * n.x, y: rhoSafe * n.y };
    const p = { x: m.x + half * tangent.x, y: m.y + half * tangent.y };
    const q = { x: m.x - half * tangent.x, y: m.y - half * tangent.y };
    const eA = scale(p, A, B), eB = scale(q, A, B), eM = scale(m, A, B);
    const slope = (dy, dx) => Math.abs(dx) < EPS ? null : dy / dx;
    const kAB = half < EPS ? null : slope(eB.y - eA.y, eB.x - eA.x);
    const kOM = Math.hypot(eM.x, eM.y) < EPS ? null : slope(eM.y, eM.x);
    const kOA = slope(eA.y, eA.x), kOB = slope(eB.y, eB.x);
    const product1 = kAB === null || kOM === null ? null : kAB * kOM;
    const product2 = kOA === null || kOB === null ? null : kOA * kOB;
    const issues = [];
    if (half < EPS) issues.push('A、B 重合，已不是两点弦');
    if (Math.hypot(eM.x, eM.y) < EPS) issues.push('M 与 O 重合，OM 不能确定直线');
    else if (kOM === null) issues.push('OM 竖直，斜率未定义');
    if (half >= EPS && kAB === null) issues.push('AB 竖直，斜率未定义');
    if (kOA === null) issues.push('OA 竖直，斜率未定义');
    if (kOB === null) issues.push('OB 竖直，斜率未定义');
    const valid = issues.length === 0;
    // Construction-level tolerance, not equality inferred from rounded slope readouts.
    const satisfies = valid && Math.abs(rhoSafe*rhoSafe-.5) < 16*Number.EPSILON
      && Math.abs(product1-product2) < 1e-7*Math.max(1,Math.abs(product1),Math.abs(product2));
    return { theta, rho: rhoSafe, normalLength, n, tangent, half, unit: { A: p, B: q, M: m },
      ellipse: { A: eA, B: eB, M: eM }, slopes: { AB: kAB, OM: kOM, OA: kOA, OB: kOB },
      product1, product2, issues, valid, satisfies,
      area: Math.abs(det(eA, eB)) / 2, unitArea: Math.abs(det(p, q)) / 2,
      intercept: Math.abs(Math.cos(theta)) < EPS ? null : rhoSafe * normalLength / Math.cos(theta) };
  }
  function transform(g, t) {
    const sx = 1 + (A - 1) * t, sy = 1 + (B - 1) * t;
    return { sx, sy, A: scale(g.unit.A, sx, sy), B: scale(g.unit.B, sx, sy),
      M: scale(g.unit.M, sx, sy), area: g.unitArea * sx * sy, factor: sx * sy };
  }
  const api = { A, B, EPS, dot, det, geometry, transform };
  root.MathModel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
