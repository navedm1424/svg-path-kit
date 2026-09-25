import { describe, it, expect } from "vitest";
import { ParametricCurve2D } from "../src/parametric-curve-2D.js";
import { Point2D } from "../src/point2D.js";

/** Simple line curve for testing base class finite-difference methods. */
class LineCurve extends ParametricCurve2D {
  constructor(
    private readonly start: Point2D,
    private readonly end: Point2D
  ) {
    super();
  }
  at(t: number): Point2D {
    return Point2D.of(
      this.start.x + t * (this.end.x - this.start.x),
      this.start.y + t * (this.end.y - this.start.y)
    );
  }
}

describe("ParametricCurve2D", () => {
  describe("tangentAt (finite difference)", () => {
    it("approximates tangent for linear curve", () => {
      const curve = new LineCurve(Point2D.of(0, 0), Point2D.of(10, 0));
      const tangent = curve.tangentAt(0.5);
      expect(tangent.x).toBeCloseTo(10, 0);
      expect(tangent.y).toBeCloseTo(0, 0);
    });
  });

  describe("accelerationAt (five-point stencil)", () => {
    it("approximates zero acceleration for line", () => {
      const curve = new LineCurve(Point2D.of(0, 0), Point2D.of(10, 20));
      const acc = curve.accelerationAt(0.5);
      expect(acc.x).toBeCloseTo(0, 0);
      expect(acc.y).toBeCloseTo(0, 0);
    });
  });
});
