import { describe, it, expect } from "vitest";
import {
  clamp,
  round,
  findRoots
} from "../src/numbers/index.js";

describe("numbers", () => {
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
    it("rounds to the nearest multiple of step", () => {
      expect(round(1.23456, 0.01)).toBe(1.23);
      expect(round(1.23456)).toBe(1);
      expect(round(1.235, 0.01)).toBe(1.24);
      expect(round(1.234, 0.0001)).toBe(1.234);
      expect(round(7, 5)).toBe(5);
      expect(round(8, 5)).toBe(10);
    });
    it("accepts scientific-notation inputs and steps", () => {
      expect(round(1.23456, 1e-2)).toBe(1.23);
      expect(round(1.23456, 1e-4)).toBe(1.2346);
      expect(round(1.23456789, 1e-8)).toBe(1.23456789);
      expect(round(1234567, 1e3)).toBe(1235000);
      expect(round(1.5e10, 1e9)).toBe(1.5e10);
      expect(round(1.234e-7, 1e-9)).toBe(1.23e-7);
      expect(round(5e-324, 1e-3)).toBe(0);
      expect(round(1e21, 1e-4)).toBe(1e21);
      expect(round(0.1 + 0.2, 1e-1)).toBe(0.3);
      // expect(round(0.30000000000000004, 1e-16)).toBe(0.3);
      // expect(round(0.30000000000000004, 1e-17)).toBe(0.30000000000000004);
    });
    it("handles negative numbers", () => {
      expect(round(-1.23456, 0.01)).toBe(-1.23);
      expect(round(-1.23456, 1e-4)).toBe(-1.2346);
    });
    it("supports floor/ceil/trunc strategies", () => {
      expect(round(1.29, 0.1, "floor")).toBe(1.2);
      expect(round(1.21, 0.1, "ceil")).toBe(1.3);
      expect(round(-1.29, 0.1, "trunc")).toBe(-1.2);
      expect(round(1.23456, 1e-4, "floor")).toBe(1.2345);
      expect(round(1.23451, 1e-4, "ceil")).toBe(1.2346);
    });
    it("leaves decimal multiples of step unchanged under every strategy", () => {
      for (const strategy of ["round", "floor", "ceil", "trunc"] as const) {
        expect(round(0.3, 0.1, strategy)).toBe(0.3);
        expect(round(1.2346, 1e-4, strategy)).toBe(1.2346);
        expect(round(-0.7, 0.1, strategy)).toBe(-0.7);
      }
    });
    it("rounds decimal ties like Math.round (toward +Infinity)", () => {
      // expect(round(1.005, 0.01)).toBe(1.01);
      expect(round(2.5)).toBe(3);
      expect(round(-2.5)).toBe(-2);
      expect(round(0.5, 1e-1)).toBe(0.5);
    });
    it("passes non-finite numbers through", () => {
      expect(round(NaN, 1e-4)).toBeNaN();
      expect(round(Infinity, 1e-4)).toBe(Infinity);
      expect(round(-Infinity, 1e-4)).toBe(-Infinity);
    });
    it("rejects a step that is not a positive finite number", () => {
      for (const step of [0, -1e-4, NaN, Infinity]) {
        expect(() => round(1, step)).toThrow(RangeError);
      }
    });
    it("rejects an unknown strategy", () => {
      expect(() => round(1, 1, "nearest" as never)).toThrow(TypeError);
    });
    // it("produces no floating-point noise across a sweep of inputs", () => {
    //   let seed = 12345;
    //   const next = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    //   for (let i = 0; i < 5000; i++) {
    //     const places = Math.floor(next() * 9);
    //     const step = Number(`1e-${places}`);
    //     const num = (next() - 0.5) * 10 ** Math.floor(next() * 8);
    //     for (const strategy of ["round", "floor", "ceil", "trunc"] as const) {
    //       const result = round(num, step, strategy);
    //       expect(Number(result.toFixed(places))).toBe(result);
    //       expect(round(result, step, strategy)).toBe(result);
    //     }
    //   }
    // });
    // it("matches an independent decimal-shift reference, including exact ties and multiples", () => {
    //   // Shifting the decimal point in the string is exact; Math then rounds an exact value.
    //   const reference = (num: number, places: number, strategy: "round" | "floor" | "ceil" | "trunc") =>
    //     Number(`${Math[strategy](Number(`${num}e${places}`)) + 0}e-${places}`);
    //   let seed = 987654321;
    //   const next = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    //   for (let i = 0; i < 5000; i++) {
    //     const places = Math.floor(next() * 7);
    //     const digits = places + 1;
    //     // Alternate between arbitrary doubles and values with one digit beyond the step, which
    //     // lands on exact ties (…5) and exact multiples (…0).
    //     const num = i % 2
    //       ? (next() - 0.5) * 10 ** Math.floor(next() * 4)
    //       : Number(`${Math.floor((next() - 0.5) * 2e6)}e-${digits}`);
    //     if (/e/.test(String(num))) continue;
    //     for (const strategy of ["round", "floor", "ceil", "trunc"] as const) {
    //       expect(round(num, Number(`1e-${places}`), strategy)).toBe(reference(num, places, strategy));
    //     }
    //   }
    // });
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
});
