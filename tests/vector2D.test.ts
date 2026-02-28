import { describe, it, expect } from "vitest";
import { Vector2D } from "../src/vector2D.js";
import { Point2D } from "../src/point2D.js";
import { Angle } from "../src/angle.js";

describe("Vector2D", () => {
  describe("NULL_VECTOR", () => {
    it("has zero components and magnitude", () => {
      expect(Vector2D.NULL_VECTOR.x).toBe(0);
      expect(Vector2D.NULL_VECTOR.y).toBe(0);
      expect(Vector2D.NULL_VECTOR.magnitude).toBe(0);
    });
  });

  describe("constructor / of", () => {
    it("stores x and y and computes magnitude", () => {
      const v = Vector2D.of(3, 4);
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
      expect(v.magnitude).toBe(5);
    });
  });

  describe("polar", () => {
    it("creates vector from radius and angle (number)", () => {
      const v = Vector2D.polar(10, 0);
      expect(v.x).toBeCloseTo(10);
      expect(v.y).toBeCloseTo(0);
      const v2 = Vector2D.polar(5, Math.PI / 2);
      expect(v2.x).toBeCloseTo(0);
      expect(v2.y).toBeCloseTo(5);
    });
    it("creates vector from radius and Angle", () => {
      const v = Vector2D.polar(10, Angle.of(0));
      expect(v.x).toBeCloseTo(10);
      expect(v.y).toBeCloseTo(0);
    });
  });

  describe("from", () => {
    it("creates vector from initial to terminal point", () => {
      const v = Vector2D.from(Point2D.of(1, 2), Point2D.of(4, 6));
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });
  });

  describe("add / subtract", () => {
    it("add returns new vector", () => {
      const a = Vector2D.of(1, 2);
      const b = Vector2D.of(3, 4);
      const c = a.add(b);
      expect(c.x).toBe(4);
      expect(c.y).toBe(6);
      expect(a.x).toBe(1);
    });
    it("subtract returns new vector", () => {
      const a = Vector2D.of(5, 5);
      const b = Vector2D.of(2, 1);
      const c = a.subtract(b);
      expect(c.x).toBe(3);
      expect(c.y).toBe(4);
    });
  });

  describe("dotProduct / crossProduct", () => {
    it("dotProduct is x1*x2 + y1*y2", () => {
      expect(Vector2D.of(1, 0).dotProduct(Vector2D.of(1, 0))).toBe(1);
      expect(Vector2D.of(1, 0).dotProduct(Vector2D.of(0, 1))).toBe(0);
      expect(Vector2D.of(3, 4).dotProduct(Vector2D.of(2, 1))).toBe(10);
    });
    it("crossProduct is x1*y2 - y1*x2", () => {
      expect(Vector2D.of(1, 0).crossProduct(Vector2D.of(0, 1))).toBe(1);
      expect(Vector2D.of(0, 1).crossProduct(Vector2D.of(1, 0))).toBe(-1);
    });
  });

  describe("angleWith / singedAngleWith", () => {
    it("angleWith returns angle in [0, π]", () => {
      const a = Vector2D.of(1, 0);
      const b = Vector2D.of(1, 1);
      const angle = a.angleWith(b);
      expect(angle).toBeCloseTo(Math.PI / 4);
    });
    it("singedAngleWith returns signed angle", () => {
      const a = Vector2D.of(1, 0);
      const b = Vector2D.of(0, 1);
      const angle = a.singedAngleWith(b);
      expect(angle).toBeCloseTo(Math.PI / 2);
    });
  });

  describe("normalize", () => {
    it("returns unit vector", () => {
      const v = Vector2D.of(3, 4).normalize();
      expect(v.magnitude).toBeCloseTo(1);
      expect(v.x).toBeCloseTo(0.6);
      expect(v.y).toBeCloseTo(0.8);
    });
    it("returns NULL_VECTOR for zero vector", () => {
      const v = Vector2D.NULL_VECTOR.normalize();
      expect(v).toBe(Vector2D.NULL_VECTOR);
    });
  });

  describe("perpendicular", () => {
    it("orientation 1 gives clockwise perpendicular in SVG", () => {
      const v = Vector2D.of(1, 0).perpendicular(1);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(1);
    });
    it("orientation -1 gives counter-clockwise", () => {
      const v = Vector2D.of(1, 0).perpendicular(-1);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(-1);
    });
    it("default orientation is 1", () => {
      const v = Vector2D.of(1, 0).perpendicular();
      expect(v.y).toBeCloseTo(1);
    });
  });

  describe("opposite", () => {
    it("returns negated vector", () => {
      const v = Vector2D.of(3, -4).opposite();
      expect(v.x).toBe(-3);
      expect(v.y).toBe(4);
    });
  });

  describe("clone", () => {
    it("returns new vector with same components", () => {
      const v = Vector2D.of(3, 4);
      const w = v.clone();
      expect(w.x).toBe(v.x);
      expect(w.y).toBe(v.y);
      expect(w).not.toBe(v);
    });
  });

  describe("scale", () => {
    it("scales in-place and returns this", () => {
      const v = Vector2D.of(2, 3);
      const ret = v.scale(2);
      expect(ret).toBe(v);
      expect(v.x).toBe(4);
      expect(v.y).toBe(6);
      expect(v.magnitude).toBeCloseTo(2 * Math.hypot(2, 3));
    });
  });

  describe("rotate", () => {
    it("rotates in-place by angle (number)", () => {
      const v = Vector2D.of(1, 0);
      v.rotate(Math.PI / 2);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(1);
    });
    it("rotates in-place by Angle", () => {
      const v = Vector2D.of(1, 0);
      v.rotate(Angle.HALF_PI);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(1);
    });
  });

  describe("toPoint", () => {
    it("returns point with same components", () => {
      const v = Vector2D.of(5, -3);
      const p = v.toPoint();
      expect(p.x).toBe(5);
      expect(p.y).toBe(-3);
    });
  });

  describe("slope", () => {
    it("returns y/x", () => {
      expect(Vector2D.of(2, 4).slope).toBe(2);
      expect(Vector2D.of(-1, 3).slope).toBe(-3);
    });
  });

  describe("angle", () => {
    it("returns atan2(y, x)", () => {
      expect(Vector2D.of(1, 0).angle).toBe(0);
      expect(Vector2D.of(1, 1).angle).toBeCloseTo(Math.PI / 4);
    });
  });
});
