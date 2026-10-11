import { describe, it, expect } from "vitest";
import { Circle, CircularArc } from "../src/curves/circle.js";
import { Ellipse, EllipticalArc } from "../src/curves/ellipse.js";
import { Superellipse } from "../src/curves/superellipse.js";
import { Point2D } from "../src/point2D.js";
import { Vector2D } from "../src/vector2D.js";
import { Angle } from "../src/angle.js";

describe("Circle", () => {
  describe("of", () => {
    it("of(radius) centers at origin", () => {
      const c = Circle.of(5);
      expect(c.center.x).toBe(0);
      expect(c.center.y).toBe(0);
      expect(c.radius).toBe(5);
    });
    it("of(center, radius) uses given center", () => {
      const center = Point2D.of(1, 2);
      const c = Circle.of(center, 3);
      expect(c.center.x).toBe(1);
      expect(c.center.y).toBe(2);
      expect(c.radius).toBe(3);
    });
    it("uses absolute value for radius", () => {
      const c = Circle.of(-4);
      expect(c.radius).toBe(4);
    });
  });

  describe("at", () => {
    it("returns point on circle at angle", () => {
      const c = Circle.of(10);
      const p = c.at(0);
      expect(p.x).toBeCloseTo(10);
      expect(p.y).toBeCloseTo(0);
      const p2 = c.at(Math.PI / 2);
      expect(p2.x).toBeCloseTo(0);
      expect(p2.y).toBeCloseTo(10);
    });
    it("accepts Angle", () => {
      const c = Circle.of(5);
      const p = c.at(Angle.HALF_PI);
      expect(p.x).toBeCloseTo(0);
      expect(p.y).toBeCloseTo(5);
    });
  });

  describe("tangentAt / accelerationAt", () => {
    it("tangent is perpendicular to radius", () => {
      const c = Circle.of(5);
      const t = c.tangentAt(0);
      expect(t.x).toBeCloseTo(0);
      expect(t.y).toBeCloseTo(5);
    });
    it("acceleration points toward center", () => {
      const c = Circle.of(5);
      const a = c.accelerationAt(0);
      expect(a.x).toBeCloseTo(-5);
      expect(a.y).toBeCloseTo(0);
    });
  });

  describe("translate", () => {
    it("moves center by vector", () => {
      const c = Circle.of(Point2D.of(0, 0), 5);
      c.translate(Vector2D.of(3, 4));
      expect(c.center.x).toBe(3);
      expect(c.center.y).toBe(4);
    });
  });
});

describe("CircularArc", () => {
  it("stores radius and angles", () => {
    const arc = new CircularArc(10, 0, Math.PI / 2);
    expect(arc.radius).toBe(10);
    expect(arc.startAngle.value).toBe(0);
    expect(arc.endAngle.value).toBeCloseTo(Math.PI / 2);
  });
  it("startingPointVector and endingPointVector", () => {
    const arc = new CircularArc(5, 0, Angle.HALF_PI);
    const start = arc.startingPointVector;
    expect(start.x).toBeCloseTo(5);
    expect(start.y).toBeCloseTo(0);
    const end = arc.endingPointVector;
    expect(end.x).toBeCloseTo(0);
    expect(end.y).toBeCloseTo(5);
  });
  it("startingTangentVector and endingTangentVector", () => {
    const arc = new CircularArc(5, 0, Angle.HALF_PI);
    const t0 = arc.startingTangentVector;
    expect(t0.x).toBeCloseTo(0);
    expect(t0.y).toBeCloseTo(5);
    const t1 = arc.endingTangentVector;
    expect(t1.x).toBeCloseTo(-5);
    expect(t1.y).toBeCloseTo(0);
  });
  it("rotation rotates vectors", () => {
    const arc = new CircularArc(5, 0, Angle.HALF_PI, Angle.HALF_PI);
    const start = arc.startingPointVector;
    expect(start.x).toBeCloseTo(0);
    expect(start.y).toBeCloseTo(5);
  });
});

describe("Ellipse", () => {
  describe("of", () => {
    it("of(a, b) centers at origin", () => {
      const e = Ellipse.of(5, 3);
      expect(e.center.x).toBe(0);
      expect(e.center.y).toBe(0);
      expect(e.semiMajorAxis).toBe(5);
      expect(e.semiMinorAxis).toBe(3);
    });
    it("of(center, a, b) uses center", () => {
      const e = Ellipse.of(Point2D.of(1, 2), 5, 3);
      expect(e.center.x).toBe(1);
      expect(e.center.y).toBe(2);
    });
    it("of(..., tilt) stores ellipse tilt", () => {
      const e = Ellipse.of(5, 3, Math.PI / 4);
      expect(e.ellipseTilt.value).toBeCloseTo(Math.PI / 4);
    });
  });

  describe("at", () => {
    it("parametric position at 0 is (a, 0) in local axes", () => {
      const e = Ellipse.of(5, 3);
      const p = e.at(0);
      expect(p.x).toBeCloseTo(5);
      expect(p.y).toBeCloseTo(0);
    });
    it("at π/2 is (0, b)", () => {
      const e = Ellipse.of(5, 3);
      const p = e.at(Math.PI / 2);
      expect(p.x).toBeCloseTo(0);
      expect(p.y).toBeCloseTo(3);
    });
  });

  describe("tangentAt / accelerationAt", () => {
    it("tangent at 0 is vertical (scaled)", () => {
      const e = Ellipse.of(5, 3);
      const t = e.tangentAt(0);
      expect(t.x).toBeCloseTo(0);
      expect(t.y).toBeCloseTo(3);
    });
  });

  describe("translate / rotate", () => {
    it("translate moves center", () => {
      const e = Ellipse.of(Point2D.of(0, 0), 5, 3);
      e.translate(Vector2D.of(1, 1));
      expect(e.center.x).toBe(1);
      expect(e.center.y).toBe(1);
    });
    it("rotate adds to ellipseTilt", () => {
      const e = Ellipse.of(5, 3, 0);
      e.rotate(Math.PI / 4);
      expect(e.ellipseTilt.value).toBeCloseTo(Math.PI / 4);
    });
  });
});

describe("EllipticalArc", () => {
  it("startingPointVector and endingPointVector", () => {
    const arc = new EllipticalArc(5, 3, 0, Math.PI / 2);
    expect(arc.startingPointVector.x).toBeCloseTo(5);
    expect(arc.startingPointVector.y).toBeCloseTo(0);
    expect(arc.endingPointVector.x).toBeCloseTo(0);
    expect(arc.endingPointVector.y).toBeCloseTo(3);
  });
  it("uses absolute axes", () => {
    const arc = new EllipticalArc(-5, -3, 0, 0);
    expect(arc.semiMajorAxis).toBe(5);
    expect(arc.semiMinorAxis).toBe(3);
  });
});

describe("Superellipse", () => {
  it("at(0) is (a, 0)", () => {
    const s = new Superellipse(4, 3, 2);
    const p = s.at(0);
    expect(p.x).toBeCloseTo(4);
    expect(p.y).toBeCloseTo(0);
  });
  it("at(π/2) is (0, b)", () => {
    const s = new Superellipse(4, 3, 2);
    const p = s.at(Math.PI / 2);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(3);
  });
  it("accepts Angle", () => {
    const s = new Superellipse(4, 3, 2);
    const p = s.at(Angle.HALF_PI);
    expect(p.y).toBeCloseTo(3);
  });
  it("tangentAt returns vector or falls back to finite difference", () => {
    const s = new Superellipse(4, 3, 2);
    const t = s.tangentAt(0.5);
    expect(Number.isFinite(t.x)).toBe(true);
    expect(Number.isFinite(t.y)).toBe(true);
  });
});
