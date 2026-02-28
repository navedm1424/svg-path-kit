import { describe, it, expect } from "vitest";
import {
  MoveCommand,
  LineCommand,
  QuadraticBezierCurveCommand,
  CubicBezierCurveCommand,
  CubicBezierEllipticalArc,
  CubicBezierHermiteCurveCommand,
  EllipticalArcCommand,
  EllipticalArcWrapperCommand,
  ChordScaledBezierCommand,
  ClosePathCommand,
  Path,
} from "../src/path.js";
import { Point2D } from "../src/point2D.js";
import { Vector2D } from "../src/vector2D.js";
import { Angle } from "../src/angle.js";
import { EllipticalArc } from "../src/curves/index.js";

const origin = Point2D.ORIGIN;
const p100 = Point2D.of(100, 0);
// const p010 = Point2D.of(0, 10);

describe("MoveCommand", () => {
  it("constructor(Point2D, Point2D)", () => {
    const cmd = new MoveCommand(origin, Point2D.of(50, 50));
    expect(cmd.initialPoint.x).toBe(0);
    expect(cmd.terminalPoint.x).toBe(50);
    expect(cmd.terminalPoint.y).toBe(50);
  });
  it("constructor(Point2D, Vector2D) adds vector to initial", () => {
    const cmd = new MoveCommand(origin, Vector2D.of(30, 40));
    expect(cmd.terminalPoint.x).toBe(30);
    expect(cmd.terminalPoint.y).toBe(40);
  });
  it("getStartVelocity and getEndVelocity are NULL_VECTOR", () => {
    const cmd = new MoveCommand(origin, p100);
    expect(cmd.getStartVelocity().magnitude).toBe(0);
    expect(cmd.getEndVelocity().magnitude).toBe(0);
  });
  it("toSVGPathCommand returns AbsoluteMovePrimitive", () => {
    const cmd = new MoveCommand(origin, Point2D.of(1, 2));
    const prim = cmd.toSVGPathCommand();
    expect(prim.getKey()).toBe("M");
  });
});

describe("LineCommand", () => {
  it("constructor with points", () => {
    const cmd = new LineCommand(origin, Point2D.of(100, 0));
    expect(cmd.terminalPoint.x).toBe(100);
    expect(cmd.length).toBe(100);
  });
  it("constructor with vector", () => {
    const cmd = new LineCommand(origin, Vector2D.of(3, 4));
    expect(cmd.terminalPoint.x).toBe(3);
    expect(cmd.terminalPoint.y).toBe(4);
    expect(cmd.length).toBe(5);
  });
  it("getStartVelocity equals getEndVelocity", () => {
    const cmd = new LineCommand(origin, Point2D.of(10, 0));
    const v = cmd.getStartVelocity();
    expect(v.x).toBe(10);
    expect(v.y).toBe(0);
    expect(cmd.getEndVelocity().x).toBe(10);
  });
  it("toSVGPathCommand returns AbsoluteLinePrimitive", () => {
    const cmd = new LineCommand(origin, p100);
    expect(cmd.toSVGPathCommand().getKey()).toBe("L");
  });
});

describe("QuadraticBezierCurveCommand", () => {
  const cp = Point2D.of(50, 50);
  const end = Point2D.of(100, 0);
  it("constructor with points", () => {
    const cmd = new QuadraticBezierCurveCommand(origin, cp, end);
    expect(cmd.controlPoint.x).toBe(50);
    expect(cmd.terminalPoint.x).toBe(100);
  });
  it("getStartVelocity is 2 * (control - initial)", () => {
    const cmd = new QuadraticBezierCurveCommand(origin, cp, end);
    const v = cmd.getStartVelocity();
    expect(v.x).toBeCloseTo(100);
    expect(v.y).toBeCloseTo(100);
  });
  it("toSVGPathCommand returns Q primitive", () => {
    const cmd = new QuadraticBezierCurveCommand(origin, cp, end);
    expect(cmd.toSVGPathCommand().getKey()).toBe("Q");
  });
});

describe("CubicBezierCurveCommand", () => {
  const c1 = Point2D.of(33, 0);
  const c2 = Point2D.of(66, 0);
  const end = Point2D.of(100, 0);
  it("constructor with points", () => {
    const cmd = new CubicBezierCurveCommand(origin, c1, c2, end);
    expect(cmd.firstControlPoint.x).toBe(33);
    expect(cmd.secondControlPoint.x).toBe(66);
    expect(cmd.terminalPoint.x).toBe(100);
  });
  it("getStartVelocity is 3 * (firstControl - initial)", () => {
    const cmd = new CubicBezierCurveCommand(origin, c1, c2, end);
    expect(cmd.getStartVelocity().x).toBeCloseTo(99);
  });
  it("toSVGPathCommand returns C primitive", () => {
    const cmd = new CubicBezierCurveCommand(origin, c1, c2, end);
    expect(cmd.toSVGPathCommand().getKey()).toBe("C");
  });
});

describe("CubicBezierEllipticalArc", () => {
  it("from semi-axes and angles", () => {
    const cmd = new CubicBezierEllipticalArc(
      origin, 50, 50, 0, Angle.HALF_PI
    );
    expect(cmd.initialPoint.x).toBe(0);
    expect(cmd.terminalPoint.x).toBeCloseTo(-50);
    expect(cmd.terminalPoint.y).toBeCloseTo(50);
  });
  it("from EllipticalArc", () => {
    const arc = new EllipticalArc(10, 10, 0, Math.PI / 2);
    const cmd = new CubicBezierEllipticalArc(origin, arc);
    expect(cmd.arc).toBe(arc);
    expect(cmd.toSVGPathCommand().getKey()).toBe("C");
  });
});

describe("CubicBezierHermiteCurveCommand", () => {
  it("constructor with point terminal", () => {
    const cmd = new CubicBezierHermiteCurveCommand(
      origin,
      Vector2D.of(10, 0),
      Vector2D.of(10, 0),
      Point2D.of(100, 0)
    );
    expect(cmd.terminalPoint.x).toBe(100);
    expect(cmd.getStartVelocity().x).toBe(10);
    expect(cmd.getEndVelocity().x).toBe(10);
  });
  it("constructor with vector terminal", () => {
    const cmd = new CubicBezierHermiteCurveCommand(
      origin,
      Vector2D.of(0, 0),
      Vector2D.of(0, 0),
      Vector2D.of(50, 50)
    );
    expect(cmd.terminalPoint.x).toBe(50);
    expect(cmd.terminalPoint.y).toBe(50);
  });
  it("toSVGPathCommand returns C", () => {
    const cmd = new CubicBezierHermiteCurveCommand(
      origin, Vector2D.NULL_VECTOR, Vector2D.NULL_VECTOR, p100
    );
    expect(cmd.toSVGPathCommand().getKey()).toBe("C");
  });
});

describe("EllipticalArcCommand", () => {
  it("from semi-axes and angles", () => {
    const cmd = new EllipticalArcCommand(
      origin, 20, 10, 0, Angle.HALF_PI
    );
    expect(cmd.terminalPoint.x).toBeCloseTo(-20);
    expect(cmd.terminalPoint.y).toBeCloseTo(10);
    expect(cmd.getStartVelocity().x).toBeCloseTo(0);
    expect(cmd.getEndVelocity().x).toBeCloseTo(-20);
  });
  it("toSVGPathCommand returns A", () => {
    const cmd = new EllipticalArcCommand(origin, 10, 10, 0, Math.PI / 2);
    expect(cmd.toSVGPathCommand().getKey()).toBe("A");
  });
});

describe("EllipticalArcWrapperCommand", () => {
  it("constructor with ending point", () => {
    const cmd = new EllipticalArcWrapperCommand(
      origin, 50, 50, 0, false, true, Point2D.of(100, 0)
    );
    expect(cmd.terminalPoint.x).toBe(100);
    expect(cmd.xRadius).toBe(50);
    expect(cmd.yRadius).toBe(50);
    expect(cmd.largeArcFlag).toBe(false);
    expect(cmd.sweepFlag).toBe(true);
  });
  it("toSVGPathCommand returns A", () => {
    const cmd = new EllipticalArcWrapperCommand(
      origin, 50, 50, 0, false, true, Point2D.of(100, 0)
    );
    expect(cmd.toSVGPathCommand().getKey()).toBe("A");
  });
});

describe("ChordScaledBezierCommand", () => {
  it("constructor with point and angles", () => {
    const cmd = new ChordScaledBezierCommand(
      origin,
      Point2D.of(100, 0),
      Angle.ZERO,
      Angle.ZERO
    );
    expect(cmd.terminalPoint.x).toBe(100);
    expect(cmd.startHandleScale).toBeCloseTo(1 / 3);
    expect(cmd.endHandleScale).toBeCloseTo(1 / 3);
  });
  it("degenerate chord uses line-like curve", () => {
    const cmd = new ChordScaledBezierCommand(
      origin, origin, 0, 0
    );
    expect(cmd.cubicBezierCurve.firstControlPoint.x).toBe(0);
    expect(cmd.cubicBezierCurve.endingPoint.x).toBe(0);
  });
  it("toSVGPathCommand returns C", () => {
    const cmd = new ChordScaledBezierCommand(
      origin, Point2D.of(100, 0), 0, 0
    );
    expect(cmd.toSVGPathCommand().getKey()).toBe("C");
  });
});

describe("ClosePathCommand", () => {
  it("terminalPoint is move command terminal", () => {
    const move = new MoveCommand(origin, Point2D.of(0, 0));
    const cmd = new ClosePathCommand(Point2D.of(100, 0), move);
    expect(cmd.terminalPoint.x).toBe(0);
    expect(cmd.terminalPoint.y).toBe(0);
  });
  it("toSVGPathCommand returns Z", () => {
    const move = new MoveCommand(origin, origin);
    const cmd = new ClosePathCommand(p100, move);
    expect(cmd.toSVGPathCommand().getKey()).toBe("Z");
  });
});

describe("Path", () => {
  it("toSVGPath returns SVGPath", () => {
    const path = new Path([
      new MoveCommand(origin, origin),
      new LineCommand(origin, p100),
    ]);
    const svg = path.toSVGPath();
    expect(svg.commands.length).toBe(2);
  });
  it("toSVGPathString returns string", () => {
    const path = new Path([
      new MoveCommand(origin, origin),
      new LineCommand(origin, Point2D.of(10, 10)),
    ]);
    const s = path.toSVGPathString();
    expect(typeof s).toBe("string");
    expect(s.length).toBeGreaterThan(0);
  });
  it("commands are frozen", () => {
    const commands = [new MoveCommand(origin, origin)];
    const path = new Path(commands);
    expect(path.commands.length).toBe(1);
    expect(() => (path.commands as any).push(null)).toThrow();
  });
});
