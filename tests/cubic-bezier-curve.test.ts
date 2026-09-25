import { describe, it, expect } from "vitest";
import {CubicBezierCurve, fitCubicBezier} from "../src/index.js";
import { Point2D } from "../src/point2D.js";
import {Circle} from "../src/curves/index.js";

describe(`${CubicBezierCurve.name}`, () => {
  const p0 = Point2D.of(0, 0);
  const p1 = Point2D.of(1, 0);
  const p2 = Point2D.of(1, 1);
  const p3 = Point2D.of(0, 1);

  const curve = new CubicBezierCurve(p0, p1, p2, p3);

  describe("at", () => {
    it("returns start at t=0", () => {
      const pt = curve.at(0);
      expect(pt.x).toBe(0);
      expect(pt.y).toBe(0);
    });
    it("returns end at t=1", () => {
      const pt = curve.at(1);
      expect(pt.x).toBe(0);
      expect(pt.y).toBe(1);
    });
    it("interpolates at t=0.5", () => {
      const pt = curve.at(0.5);
      expect(pt.x).toBeCloseTo(0.75);
      expect(pt.y).toBeCloseTo(0.5);
    });
  });

  describe("tangentAt", () => {
    it("tangent at t=0 points toward first control", () => {
      const t = curve.tangentAt(0);
      expect(t.x).toBeCloseTo(3 * (p1.x - p0.x));
      expect(t.y).toBeCloseTo(3 * (p1.y - p0.y));
    });
    it("tangent at t=1 points from second control to end", () => {
      const t = curve.tangentAt(1);
      expect(t.x).toBeCloseTo(3 * (p3.x - p2.x));
      expect(t.y).toBeCloseTo(3 * (p3.y - p2.y));
    });
  });

  describe("accelerationAt", () => {
    it("returns finite vector at t=0.5", () => {
      const acc = curve.accelerationAt(0.5);
      expect(Number.isFinite(acc.x)).toBe(true);
      expect(Number.isFinite(acc.y)).toBe(true);
    });
  });

  // describe("splitAt", () => {
  //   it("left side at t=0.5 starts at p0 and ends at point on curve", () => {
  //     const left = curve.splitAt(0.5, "left");
  //     expect(left.startingPoint.x).toBe(p0.x);
  //     expect(left.startingPoint.y).toBe(p0.y);
  //     const mid = curve.at(0.5);
  //     expect(left.endingPoint.x).toBeCloseTo(mid.x);
  //     expect(left.endingPoint.y).toBeCloseTo(mid.y);
  //   });
  //   it("right side at t=0.5 starts at point on curve and ends at p3", () => {
  //     const right = curve.splitAt(0.5, "right");
  //     const mid = curve.at(0.5);
  //     expect(right.startingPoint.x).toBeCloseTo(0);
  //     expect(right.startingPoint.y).toBeCloseTo(0);
  //     expect(right.endingPoint.x).toBeCloseTo(p3.x - mid.x);
  //     expect(right.endingPoint.y).toBeCloseTo(p3.y - mid.y);
  //   });
  //   it("left at t=0 returns degenerate segment", () => {
  //     const left = curve.splitAt(0, "left");
  //     expect(left.startingPoint.x).toBe(p0.x);
  //     expect(left.endingPoint.x).toBeCloseTo(p0.x);
  //     expect(left.endingPoint.y).toBeCloseTo(p0.y);
  //   });
  //   it("left at t=1 returns full curve", () => {
  //     const left = curve.splitAt(1, "left");
  //     expect(left.endingPoint.x).toBeCloseTo(p3.x);
  //     expect(left.endingPoint.y).toBeCloseTo(p3.y);
  //   });
  // });
});


describe(`${fitCubicBezier.name}`, () => {
  it("constructs fit for segment", () => {
    const curve = Circle.of(10);
    const fit = fitCubicBezier(curve, 0, Math.PI / 2);
    expect(fit).toBeDefined();
    expect(fit.startingPoint.x).toBeCloseTo(10);
    expect(fit.startingPoint.y).toBeCloseTo(0);
    expect(fit.endingPoint.x).toBeCloseTo(0);
    expect(fit.endingPoint.y).toBeCloseTo(10);
  });
  it("throws when curve undefined at segment", () => {
    const curve = {
      at: () => Point2D.of(NaN, 0),
      tangentAt: () => ({ x: 1, y: 0, normalize: () => ({ x: 1, y: 0 }), scale: () => ({ x: 1, y: 0 }) }),
    } as any;
    expect(() => fitCubicBezier(curve, 0, 1)).toThrow("not defined");
  });
});
