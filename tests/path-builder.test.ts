import { describe, it, expect } from "vitest";
import { PathBuilder } from "../src/path-builder.js";
import { Point2D } from "../src/point2D.js";
import { Vector2D } from "../src/vector2D.js";
import { Angle } from "../src/angle.js";
import { CircularArc, EllipticalArc } from "../src/curves/index.js";

describe("PathBuilder", () => {
  describe("static m()", () => {
    it("m(Point2D) starts at that point", () => {
      const pb = PathBuilder.m(Point2D.of(10, 20));
      expect(pb.pathStart.x).toBe(10);
      expect(pb.pathStart.y).toBe(20);
      expect(pb.currentPosition.x).toBe(10);
      expect(pb.currentPosition.y).toBe(20);
    });
    it("m(Vector2D) starts at origin + vector (move to offset)", () => {
      const pb = PathBuilder.m(Vector2D.of(5, 5));
      expect(pb.currentPosition.x).toBe(5);
      expect(pb.currentPosition.y).toBe(5);
    });
    it("throws on invalid argument type", () => {
      expect(() => PathBuilder.m(null as any)).toThrow("Invalid argument type");
      expect(() => PathBuilder.m(42 as any)).toThrow("Invalid argument type");
    });
  });

  describe("lastCommand", () => {
    it("returns the last appended command", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      expect(pb.lastCommand).toBe(pb.firstCommand);
      const line = pb.l(Point2D.of(10, 0));
      expect(pb.lastCommand).toBe(line);
    });
  });

  describe("m (move)", () => {
    it("appends MoveCommand and updates current position", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      pb.l(Point2D.of(100, 0));
      const move = pb.m(Point2D.of(50, 50));
      expect(move.terminalPoint.x).toBe(50);
      expect(move.terminalPoint.y).toBe(50);
      expect(pb.currentPosition.x).toBe(50);
    });
  });

  describe("l (line)", () => {
    it("appends LineCommand", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      const line = pb.l(Point2D.of(100, 0));
      expect(line.terminalPoint.x).toBe(100);
      expect(pb.currentPosition.x).toBe(100);
    });
    it("l(Vector2D) uses offset from current", () => {
      const pb = PathBuilder.m(Point2D.of(10, 10));
      pb.l(Vector2D.of(5, 0));
      expect(pb.currentPosition.x).toBe(15);
      expect(pb.currentPosition.y).toBe(10);
    });
  });

  describe("q (quadratic)", () => {
    it("appends QuadraticBezierCurveCommand", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      const q = pb.q(Point2D.of(50, 50), Point2D.of(100, 0));
      expect(q.controlPoint.x).toBe(50);
      expect(q.terminalPoint.x).toBe(100);
    });
  });

  describe("c (cubic)", () => {
    it("appends CubicBezierCurveCommand", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      const c = pb.c(
        Point2D.of(33, 0),
        Point2D.of(66, 0),
        Point2D.of(100, 0)
      );
      expect(c.firstControlPoint.x).toBe(33);
      expect(c.secondControlPoint.x).toBe(66);
      expect(c.terminalPoint.x).toBe(100);
    });
  });

  describe("a (elliptical arc wrapper)", () => {
    it("appends EllipticalArcWrapperCommand", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      const arc = pb.a(50, 50, 0, false, true, Point2D.of(100, 0));
      expect(arc.xRadius).toBe(50);
      expect(arc.terminalPoint.x).toBe(100);
    });
  });

  describe("circularArc", () => {
    it("with radius and angles", () => {
      const pb = PathBuilder.m(Point2D.of(50, 50));
      const cmd = pb.circularArc(10, 0, Angle.HALF_PI);
      expect(cmd.arc.semiMajorAxis).toBe(10);
      expect(cmd.arc.semiMinorAxis).toBe(10);
      expect(cmd.terminalPoint.x).toBeCloseTo(40);
      expect(cmd.terminalPoint.y).toBeCloseTo(60);
    });
    it("with CircularArc object", () => {
      const pb = PathBuilder.m(Point2D.of(0, 0));
      const arc = new CircularArc(5, 0, Math.PI);
      const cmd = pb.circularArc(arc);
      expect(cmd.arc.semiMajorAxis).toBe(5);
      expect(cmd.arc.semiMinorAxis).toBe(5);
    });
  });

  describe("ellipticalArc", () => {
    it("with semi-axes and angles", () => {
      const pb = PathBuilder.m(Point2D.of(0, 0));
      const cmd = pb.ellipticalArc(20, 10, 0, Angle.HALF_PI);
      expect(cmd.arc.semiMajorAxis).toBe(20);
      expect(cmd.arc.semiMinorAxis).toBe(10);
    });
    it("with EllipticalArc object", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      const arc = new EllipticalArc(10, 5, 0, Math.PI / 2);
      const cmd = pb.ellipticalArc(arc);
      expect(cmd.arc).toBe(arc);
    });
  });

  describe("hermiteCurve", () => {
    it("appends CubicBezierHermiteCurveCommand", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      const cmd = pb.hermiteCurve(
        Vector2D.of(10, 0),
        Vector2D.of(10, 0),
        Point2D.of(100, 0)
      );
      expect(cmd.terminalPoint.x).toBe(100);
      expect(cmd.getStartVelocity().x).toBe(10);
    });
  });

  describe("bezierCircularArc", () => {
    it("appends CubicBezierEllipticalArc", () => {
      const pb = PathBuilder.m(Point2D.of(50, 50));
      const cmd = pb.bezierCircularArc(10, 0, Angle.HALF_PI);
      expect(cmd.cubicBezierCurve).toBeDefined();
      expect(cmd.terminalPoint.x).toBeCloseTo(40);
      expect(cmd.terminalPoint.y).toBeCloseTo(60);
    });
  });

  describe("bezierEllipticalArc", () => {
    it("appends CubicBezierEllipticalArc", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      const cmd = pb.bezierEllipticalArc(20, 10, 0, Angle.HALF_PI);
      expect(cmd.cubicBezierCurve).toBeDefined();
    });
  });

  describe("chordScaledBezier", () => {
    it("appends ChordScaledBezierCommand", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      const cmd = pb.chordScaledBezier(
        Point2D.of(100, 0),
        Angle.ZERO,
        Angle.ZERO
      );
      expect(cmd.terminalPoint.x).toBe(100);
      expect(cmd.startHandleScale).toBeCloseTo(1 / 3);
    });
  });

  describe("z (close path)", () => {
    it("appends ClosePathCommand", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      pb.l(Point2D.of(100, 0));
      pb.l(Point2D.of(100, 100));
      const close = pb.z();
      expect(close.terminalPoint.x).toBe(0);
      expect(close.terminalPoint.y).toBe(0);
    });
  });

  describe("toPath / toSVGPathString", () => {
    it("toPath returns Path with all commands", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      pb.l(Point2D.of(10, 0));
      pb.l(Point2D.of(10, 10));
      const path = pb.toPath();
      expect(path.commands.length).toBe(3);
    });
    it("toSVGPathString returns valid path string", () => {
      const pb = PathBuilder.m(Point2D.ORIGIN);
      pb.l(Point2D.of(100, 0));
      pb.l(Point2D.of(100, 100));
      pb.z();
      const s = pb.toSVGPathString();
      expect(s).toMatch(/M\s+0\s+0/);
      expect(s).toContain("L");
      expect(s).toContain("Z");
    });
  });
});
