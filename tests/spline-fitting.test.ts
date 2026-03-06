import { describe, it, expect } from "vitest";
import {
  findCriticalTs,
  fitSplineBySubdivision,
  fitSplineInSteps,
  fitSplineAtParams,
  fitSplineTo,
  cardinalSpline,
  catmullRomSpline,
} from "../src/spline-fitting.js";
import { PathBuilder } from "../src/path-builder.js";
import { Point2D } from "../src/point2D.js";
import {CubicBezierCurve} from "../src/cubic-bezier-curve.js";
import { Circle } from "../src/curves/index.js";

describe("findCriticalTs", () => {
  it("returns sorted array of critical t values", () => {
    const curve = new CubicBezierCurve(
      Point2D.of(0, 0),
      Point2D.of(100, 0),
      Point2D.of(0, 100),
      Point2D.of(100, 100)
    );
    const ts = findCriticalTs(curve, 0, 1);
    expect(Array.isArray(ts)).toBe(true);
    for (let i = 1; i < ts.length; i++) {
      expect(ts[i]).toBeGreaterThanOrEqual(ts[i - 1]!);
    }
  });
  it("includes extrema and inflection points", () => {
    const circle = Circle.of(10);
    const ts = findCriticalTs(circle, 0, 2 * Math.PI);
    expect(ts.length).toBeGreaterThanOrEqual(2);
  });
});

describe("fitSplineBySubdivision", () => {
  it("returns array of CubicBezierCurveCommand", () => {
    const pb = PathBuilder.m(Point2D.of(10, 0));
    const circle = Circle.of(10);
    const spline = fitSplineBySubdivision(pb, circle, 0, Math.PI / 2, 0.5);
    expect(spline.length).toBeGreaterThanOrEqual(1);
    expect(spline[0]).toBeDefined();
    expect(spline[0]!.terminalPoint).toBeDefined();
  });
  it("respects tolerance", () => {
    const pb = PathBuilder.m(Point2D.of(10, 0));
    const circle = Circle.of(10);
    const loose = fitSplineBySubdivision(pb, circle, 0, Math.PI / 2, 2);
    const tight = fitSplineBySubdivision(pb, circle, 0, Math.PI / 2, 0.01);
    expect(tight.length).toBeGreaterThanOrEqual(loose.length);
  });
});

describe("fitSplineInSteps", () => {
  it("returns steps segments", () => {
    const pb = PathBuilder.m(Point2D.of(10, 0));
    const circle = Circle.of(10);
    const spline = fitSplineInSteps(pb, circle, 0, Math.PI / 2, 4);
    expect(spline.length).toBeGreaterThanOrEqual(1);
  });
});

describe("fitSplineAtParams", () => {
  it("fits one segment between two params", () => {
    const pb = PathBuilder.m(Point2D.of(10, 0));
    const circle = Circle.of(10);
    const spline = fitSplineAtParams(pb, circle, 0, Math.PI / 2);
    expect(spline.length).toBe(1);
  });
  it("fits multiple segments for multiple breakpoints", () => {
    const pb = PathBuilder.m(Point2D.of(10, 0));
    const circle = Circle.of(10);
    const spline = fitSplineAtParams(pb, circle, 0, Math.PI / 4, Math.PI / 2);
    expect(spline.length).toBe(2);
  });
});

describe("fitSplineTo", () => {
  it("fits curve segment", () => {
    const pb = PathBuilder.m(Point2D.of(10, 0));
    const circle = Circle.of(10);
    const spline = fitSplineTo(pb, circle, 0, Math.PI / 2);
    expect(spline.length).toBeGreaterThanOrEqual(1);
  });
});

describe("cardinalSpline", () => {
  it("returns empty array for no control points", () => {
    const pb = PathBuilder.m(Point2D.ORIGIN);
    const spline = cardinalSpline(pb, 0.5);
    expect(spline).toEqual([]);
  });
  it("returns Hermite commands for control points", () => {
    const pb = PathBuilder.m(Point2D.of(0, 0));
    const spline = cardinalSpline(pb, 0.5, Point2D.of(50, 0), Point2D.of(100, 50));
    expect(spline.length).toBe(2);
    expect(pb.currentPosition.x).toBe(100);
    expect(pb.currentPosition.y).toBe(50);
  });
});

describe("catmullRomSpline", () => {
  it("is Cardinal with tension 0.5", () => {
    const pb = PathBuilder.m(Point2D.of(0, 0));
    const spline = catmullRomSpline(pb, Point2D.of(50, 0), Point2D.of(100, 0));
    expect(spline.length).toBe(2);
  });
});
