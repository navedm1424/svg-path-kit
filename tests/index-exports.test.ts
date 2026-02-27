import { describe, it, expect } from "vitest";
import {
  Angle,
  Point2D,
  Vector2D,
  CubicBezierCurve,
  PathBuilder,
  Path,
  SVGPath,
  findCriticalTs,
  fitSplineBySubdivision,
  fitSplineAtParams,
  CubicBezierFit,
  cardinalSpline,
  catmullRomSpline,
  fitSplineTo,
  fitSplineInSteps,
} from "../src/index.js";
import { round, clamp, findRoots } from "../src/numbers/index.js";
import { Circle, Ellipse, Superellipse, EllipticalArc, CircularArc } from "../src/curves/index.js";

describe("Main index exports", () => {
  it("exports geometry types", () => {
    expect(Angle.ZERO).toBeDefined();
    expect(Point2D.ORIGIN).toBeDefined();
    expect(Vector2D.NULL_VECTOR).toBeDefined();
    expect(CubicBezierCurve).toBeDefined();
  });

  it("exports path building", () => {
    const pb = PathBuilder.m(Point2D.ORIGIN);
    pb.l(Point2D.of(10, 0));
    const path = pb.toPath();
    expect(path).toBeInstanceOf(Path);
    expect(path.toSVGPath()).toBeInstanceOf(SVGPath);
  });

  it("exports spline fitting", () => {
    expect(typeof findCriticalTs).toBe("function");
    expect(typeof fitSplineBySubdivision).toBe("function");
    expect(typeof fitSplineAtParams).toBe("function");
    expect(CubicBezierFit).toBeDefined();
    expect(typeof cardinalSpline).toBe("function");
    expect(typeof catmullRomSpline).toBe("function");
    expect(typeof fitSplineTo).toBe("function");
    expect(typeof fitSplineInSteps).toBe("function");
  });
});

describe("Numbers subpath exports", () => {
  it("exports round, clamp, findRoots", () => {
    expect(round(1.234, 2)).toBe(1.23);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(findRoots((t) => t - 0.5, 0, 1).length).toBeGreaterThanOrEqual(0);
  });
});

describe("Curves subpath exports", () => {
  it("exports Circle, Ellipse, Superellipse, arcs", () => {
    const c = Circle.of(5);
    expect(c.at(0).x).toBe(5);
    const e = Ellipse.of(5, 3);
    expect(e.at(0).x).toBe(5);
    const s = new Superellipse(4, 3, 2);
    expect(s.at(0).x).toBe(4);
    expect(EllipticalArc).toBeDefined();
    expect(CircularArc).toBeDefined();
  });
});
