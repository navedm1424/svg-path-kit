import { describe, it, expect } from "vitest";
import {
  clamp,
  saturate,
  round,
  findRoots,
  lerp,
  invLerp,
  remap,
} from "../src/numbers/index.js";

describe("number-utils", () => {
  describe("clamp", () => {
    it("returns value when within [min, max]", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
    it("clamps to max when value > max", () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(10.1, 0, 10)).toBe(10);
    });
    it("clamps to min when value < min", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-0.1, 0, 10)).toBe(0);
    });
    it("swaps min and max when min > max", () => {
      expect(clamp(5, 10, 0)).toBe(5);
      expect(clamp(15, 10, 0)).toBe(10);
      expect(clamp(-5, 10, 0)).toBe(0);
    });
  });

  describe("saturate", () => {
    it("returns value when in [0, 1]", () => {
      expect(saturate(0)).toBe(0);
      expect(saturate(0.5)).toBe(0.5);
      expect(saturate(1)).toBe(1);
    });
    it("clamps to 1 when value > 1", () => {
      expect(saturate(1.5)).toBe(1);
      expect(saturate(100)).toBe(1);
    });
    it("clamps to 0 when value < 0", () => {
      expect(saturate(-0.5)).toBe(0);
      expect(saturate(-100)).toBe(0);
    });
  });

  // describe("ifNaN", () => {
  //   it("returns num when it is not NaN", () => {
  //     expect(ifNaN(0, 42)).toBe(0);
  //     expect(ifNaN(1.5, 42)).toBe(1.5);
  //     expect(ifNaN(Infinity, 42)).toBe(Infinity);
  //   });
  //   it("returns fallback when num is NaN", () => {
  //     expect(ifNaN(NaN, 42)).toBe(42);
  //     expect(ifNaN(NaN, 0)).toBe(0);
  //   });
  // });

  // describe("ifNegative", () => {
  //   it("returns num when num >= 0", () => {
  //     expect(ifNegative(0, (n) => n * 2)).toBe(0);
  //     expect(ifNegative(5, (n) => n * 2)).toBe(5);
  //   });
  //   it("returns mapper(num) when num < 0", () => {
  //     expect(ifNegative(-3, (n) => -n)).toBe(3);
  //     expect(ifNegative(-1, (n) => n + 10)).toBe(9);
  //   });
  // });
});

describe("math-utils", () => {
  describe("round", () => {
    it("rounds to specified decimal places", () => {
      expect(round(1.23456, 2)).toBe(1.23);
      expect(round(1.23456, 0)).toBe(1);
      expect(round(1.235, 2)).toBe(1.24);
      expect(round(1.234, 4)).toBe(1.234);
    });
    it("handles negative numbers", () => {
      expect(round(-1.23456, 2)).toBe(-1.23);
    });
  });

  // describe("continuousAngle", () => {
  //   it("returns theta1 when already close to theta0", () => {
  //     expect(continuousAngle(0, 0.1)).toBeCloseTo(0.1);
  //     expect(continuousAngle(Math.PI, Math.PI + 0.1)).toBeCloseTo(Math.PI + 0.1);
  //   });
  //   it("unwraps theta1 to be closest to theta0", () => {
  //     const result = continuousAngle(0, 2 * Math.PI + 0.1);
  //     expect(Math.abs(result - 0.1)).toBeLessThan(0.01);
  //   });
  // });

  // describe("orderOfMagnitude", () => {
  //   it("returns 0 for zero", () => {
  //     expect(orderOfMagnitude(0)).toBe(0);
  //   });
  //   it("returns floor of log10(|n|) for non-zero", () => {
  //     expect(orderOfMagnitude(1)).toBe(0);
  //     expect(orderOfMagnitude(10)).toBe(1);
  //     expect(orderOfMagnitude(100)).toBe(2);
  //     expect(orderOfMagnitude(0.1)).toBe(-1);
  //     expect(orderOfMagnitude(0.01)).toBe(-2);
  //     expect(orderOfMagnitude(-1000)).toBe(3);
  //   });
  // });

  describe("findRoots", () => {
    it("throws on invalid arguments", () => {
      expect(() => findRoots(() => 0, NaN, 1)).toThrow("invalid arguments");
      expect(() => findRoots(() => 0, 0, NaN)).toThrow("invalid arguments");
      expect(() => findRoots(() => 0, Infinity, 1)).toThrow("invalid arguments");
    });
    it("finds root at start when f(tStart) ≈ 0", () => {
      const roots = findRoots((t) => t - 0.5, 0.5, 1);
      expect(roots.length).toBeGreaterThanOrEqual(1);
      expect(roots[0]).toBeCloseTo(0.5, 2);
    });
    it("finds roots where f changes sign", () => {
      const roots = findRoots((t) => t - 0.5, 0, 1);
      expect(roots.some((r) => Math.abs(r - 0.5) < 0.01)).toBe(true);
    });
    it("finds multiple roots", () => {
      const roots = findRoots((t) => Math.sin(t), 0, 2 * Math.PI);
      expect(roots.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("lerp", () => {
    it("interpolates between start and end", () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0.3)).toBe(3);
    });
    it("clamps result to [start, end]", () => {
      expect(lerp(0, 10, -0.5)).toBe(0);
      expect(lerp(0, 10, 1.5)).toBe(10);
    });
  });

  describe("invLerp", () => {
    it("returns 0 when v === start", () => {
      expect(invLerp(0, 10, 0)).toBe(0);
    });
    it("returns 1 when v === end", () => {
      expect(invLerp(0, 10, 10)).toBe(1);
    });
    it("returns 0.5 when v is midpoint", () => {
      expect(invLerp(0, 10, 5)).toBe(0.5);
    });
    it("saturates to [0, 1]", () => {
      expect(invLerp(0, 10, -5)).toBe(0);
      expect(invLerp(0, 10, 15)).toBe(1);
    });
  });

  describe("remap", () => {
    it("returns value when ranges are same", () => {
      expect(remap(5, 0, 10, 0, 10)).toBe(5);
    });
    it("maps from current range to new range", () => {
      expect(remap(5, 0, 10, 0, 100)).toBe(50);
      expect(remap(0, 0, 10, 100, 200)).toBe(100);
      expect(remap(10, 0, 10, 100, 200)).toBe(200);
    });
    it("clamps when value outside current range", () => {
      expect(remap(-5, 0, 10, 0, 100)).toBe(0);
      expect(remap(15, 0, 10, 0, 100)).toBe(100);
    });
  });
});
