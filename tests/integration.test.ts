import { describe, it, expect } from "vitest";
import { PathBuilder } from "../src/path-builder.js";
import { Point2D } from "../src/point2D.js";
import { Vector2D } from "../src/vector2D.js";
import { Angle } from "../src/angle.js";
import { Circle } from "../src/curves/index.js";
import { fitSplineBySubdivision, fitSplineAtParams, catmullRomSpline } from "../src/spline-fitting.js";
import { CubicBezierCurve } from "../src/cubic-bezier-curve.js";

describe("Integration: PathBuilder → Path → SVG string", () => {
  it("builds path with move, line, close and produces valid SVG path string", () => {
    const pb = PathBuilder.m(Point2D.of(0, 0));
    pb.l(Point2D.of(100, 0));
    pb.l(Point2D.of(100, 100));
    pb.l(Point2D.of(0, 100));
    pb.z();
    const path = pb.toPath();
    const str = path.toSVGPathString();
    expect(str).toMatch(/M\s+0\s+0/);
    expect(str).toContain("L");
    expect(str).toContain("Z");
    expect(path.commands.length).toBe(5);
  });

  it("Path.toSVGPath().toString() matches Path.toSVGPathString()", () => {
    const pb = PathBuilder.m(Point2D.ORIGIN);
    pb.l(Point2D.of(10, 10));
    const path = pb.toPath();
    expect(path.toSVGPathString()).toBe(path.toSVGPath().toString());
  });

  it("builds path with circular arc and cubic arc", () => {
    const center = Point2D.of(50, 50);
    const pb = PathBuilder.m(Point2D.of(60, 50));
    pb.circularArc(10, 0, Angle.PI);
    pb.bezierCircularArc(10, Angle.PI, Angle.TWO_PI);
    const path = pb.toPath();
    expect(path.commands.length).toBe(3);
    const str = path.toSVGPathString();
    expect(str).toMatch(/[AC]/);
  });

  it("builds path with chord-scaled bezier and hermite", () => {
    const pb = PathBuilder.m(Point2D.ORIGIN);
    pb.chordScaledBezier(Point2D.of(100, 0), Angle.ZERO, Angle.ZERO);
    pb.hermiteCurve(
      Vector2D.of(0, 0),
      Vector2D.of(0, 0),
      Point2D.of(100, 50)
    );
    const path = pb.toPath();
    expect(path.commands.length).toBe(3);
  });
});

describe("Integration: Spline fitting with PathBuilder", () => {
  it("fitSplineBySubdivision then toPath produces valid path", () => {
    const circle = Circle.of(20);
    const pb = PathBuilder.m(Point2D.of(20, 0));
    const commands = fitSplineBySubdivision(pb, circle, 0, Math.PI / 2, 0.3);
    expect(commands.length).toBeGreaterThanOrEqual(1);
    const path = pb.toPath();
    const str = path.toSVGPathString();
    expect(str).toMatch(/M\s+20\s+0/);
    expect(str).toContain("C");
  });

  it("fitSplineAtParams then path string is valid", () => {
    const curve = new CubicBezierCurve(
      Point2D.of(0, 0),
      Point2D.of(50, 0),
      Point2D.of(50, 100),
      Point2D.of(0, 100)
    );
    const pb = PathBuilder.m(Point2D.ORIGIN);
    const commands = fitSplineAtParams(pb, curve, 0, 0.5, 1);
    expect(commands.length).toBe(2);
    const path = pb.toPath();
    expect(path.toSVGPathString().length).toBeGreaterThan(0);
  });

  it("catmullRomSpline through points produces continuous path", () => {
    const pb = PathBuilder.m(Point2D.of(0, 0));
    catmullRomSpline(
      pb,
      Point2D.of(25, 0),
      Point2D.of(50, 25),
      Point2D.of(75, 0),
      Point2D.of(100, 0)
    );
    expect(pb.currentPosition.x).toBe(100);
    expect(pb.currentPosition.y).toBe(0);
    const path = pb.toPath();
    expect(path.commands.length).toBeGreaterThan(1);
  });
});

describe("Integration: Path export and re-parse", () => {
  it("exported pathData is valid SVG path syntax", () => {
    const pb = PathBuilder.m(Point2D.of(0, 0));
    pb.l(Point2D.of(100, 0));
    pb.l(Point2D.of(100, 100));
    pb.z();
    const path = pb.toPath();
    const str = path.toSVGPathString();
    expect(str).toMatch(/^M\s+[\d.-]+\s+[\d.-]+/);
    expect(str.trim().length).toBeGreaterThan(0);
  });
});
