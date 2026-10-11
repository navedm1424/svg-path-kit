import { describe, it, expect } from "vitest";
import {
  AbsoluteMovePrimitive,
  RelativeMovePrimitive,
  AbsoluteLinePrimitive,
  RelativeLinePrimitive,
  AbsoluteQuadraticBezierCurvePrimitive,
  RelativeQuadraticBezierCurvePrimitive,
  AbsoluteCubicBezierCurvePrimitive,
  RelativeCubicBezierCurvePrimitive,
  AbsoluteEllipticalArcPrimitive,
  RelativeEllipticalArcPrimitive,
  AbsoluteClosePathPrimitive,
  RelativeClosePathPrimitive,
  SVGPath,
} from "../src/svg-path.js";
import { Point2D } from "../src/point2D.js";
import { Vector2D } from "../src/vector2D.js";

describe("Move primitives", () => {
  it("AbsoluteMovePrimitive getKey and toString", () => {
    const m = new AbsoluteMovePrimitive(Point2D.of(10, 20));
    expect(m.getKey()).toBe("M");
    expect(m.toString()).toMatch(/M\s+10\s+20/);
  });
  it("RelativeMovePrimitive getKey and toString", () => {
    const m = new RelativeMovePrimitive(Vector2D.of(5, -5));
    expect(m.getKey()).toBe("m");
    expect(m.toString()).toMatch(/m\s+5\s+-5/);
  });
});

describe("Line primitives", () => {
  it("AbsoluteLinePrimitive", () => {
    const l = new AbsoluteLinePrimitive(Point2D.of(100, 50));
    expect(l.getKey()).toBe("L");
    expect(l.toString()).toMatch(/L\s+100\s+50/);
  });
  it("RelativeLinePrimitive", () => {
    const l = new RelativeLinePrimitive(Vector2D.of(50, 0));
    expect(l.getKey()).toBe("l");
    expect(l.toString()).toMatch(/l\s+50\s+0/);
  });
});

describe("Quadratic Bézier primitives", () => {
  it("AbsoluteQuadraticBezierCurvePrimitive", () => {
    const q = new AbsoluteQuadraticBezierCurvePrimitive(
      Point2D.of(50, 0),
      Point2D.of(100, 100)
    );
    expect(q.getKey()).toBe("Q");
    expect(q.toString()).toContain("50 0");
    expect(q.toString()).toContain("100 100");
  });
  it("RelativeQuadraticBezierCurvePrimitive", () => {
    const q = new RelativeQuadraticBezierCurvePrimitive(
      Vector2D.of(50, 0),
      Vector2D.of(50, 100)
    );
    expect(q.getKey()).toBe("q");
  });
});

describe("Cubic Bézier primitives", () => {
  it("AbsoluteCubicBezierCurvePrimitive", () => {
    const c = new AbsoluteCubicBezierCurvePrimitive(
      Point2D.of(33, 0),
      Point2D.of(66, 100),
      Point2D.of(100, 100)
    );
    expect(c.getKey()).toBe("C");
    expect(c.toString()).toContain("33 0");
    expect(c.toString()).toContain("66 100");
    expect(c.toString()).toContain("100 100");
  });
  it("RelativeCubicBezierCurvePrimitive", () => {
    const c = new RelativeCubicBezierCurvePrimitive(
      Vector2D.of(33, 0),
      Vector2D.of(33, 100),
      Vector2D.of(100, 100)
    );
    expect(c.getKey()).toBe("c");
  });
});

describe("Elliptical arc primitives", () => {
  it("AbsoluteEllipticalArcPrimitive", () => {
    const a = new AbsoluteEllipticalArcPrimitive(
      50, 50, 0, 0, 1,
      Point2D.of(100, 0)
    );
    expect(a.getKey()).toBe("A");
    expect(a.toString()).toMatch(/A\s+50\s+50/);
    expect(a.endingPoint.x).toBe(100);
    expect(a.endingPoint.y).toBe(0);
  });
  it("RelativeEllipticalArcPrimitive", () => {
    const a = new RelativeEllipticalArcPrimitive(
      50, 50, 0, 0, 1,
      Vector2D.of(50, -50)
    );
    expect(a.getKey()).toBe("a");
  });
});

describe("Close path primitives", () => {
  it("AbsoluteClosePathPrimitive", () => {
    const z = new AbsoluteClosePathPrimitive();
    expect(z.getKey()).toBe("Z");
    expect(z.toString()).toBe("Z");
  });
  it("RelativeClosePathPrimitive", () => {
    const z = new RelativeClosePathPrimitive();
    expect(z.getKey()).toBe("z");
    expect(z.toString()).toBe("z");
  });
});

describe("SVGPath", () => {
  it("toString joins commands with space", () => {
    const path = new SVGPath([
      new AbsoluteMovePrimitive(Point2D.of(0, 0)),
      new AbsoluteLinePrimitive(Point2D.of(100, 0)),
      new AbsoluteClosePathPrimitive(),
    ]);
    const s = path.toString();
    expect(s).toMatch(/M\s+0\s+0/);
    expect(s).toMatch(/L\s+100\s+0/);
    expect(s).toContain("Z");
  });
  it("commands are readonly", () => {
    const commands = [
      new AbsoluteMovePrimitive(Point2D.of(0, 0)),
    ];
    const path = new SVGPath(commands);
    expect(path.commands.length).toBe(1);
    expect(() => (path as any).commands.push(null)).toThrow();
  });
});
