import { describe, it, expect } from "vitest";
import { Point2D } from "../src/point2D.js";
import { Vector2D } from "../src/vector2D.js";

describe("Point2D", () => {
  describe("ORIGIN", () => {
    it("is (0, 0)", () => {
      expect(Point2D.ORIGIN.x).toBe(0);
      expect(Point2D.ORIGIN.y).toBe(0);
    });
  });

  describe("of", () => {
    it("creates point with x and y", () => {
      const p = Point2D.of(3, 4);
      expect(p.x).toBe(3);
      expect(p.y).toBe(4);
    });
  });

  describe("add", () => {
    it("translates by vector", () => {
      const p = Point2D.of(1, 2);
      const v = Vector2D.of(10, 20);
      const q = p.add(v);
      expect(q.x).toBe(11);
      expect(q.y).toBe(22);
      expect(p.x).toBe(1);
      expect(p.y).toBe(2);
    });
  });

  describe("toVector", () => {
    it("returns vector with same components", () => {
      const p = Point2D.of(5, -3);
      const v = p.toVector();
      expect(v.x).toBe(5);
      expect(v.y).toBe(-3);
    });
  });
});
