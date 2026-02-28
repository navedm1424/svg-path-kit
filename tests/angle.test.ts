import { describe, it, expect } from "vitest";
import { Angle } from "../src/angle.js";

describe("Angle", () => {
  describe("static constants", () => {
    it("ZERO has value 0", () => {
      expect(Angle.ZERO.value).toBe(0);
      expect(Angle.ZERO.sine).toBe(0);
      expect(Angle.ZERO.cosine).toBe(1);
    });
    it("HALF_PI is π/2", () => {
      expect(Angle.HALF_PI.value).toBeCloseTo(Math.PI / 2);
      expect(Angle.HALF_PI.sine).toBeCloseTo(1);
      expect(Angle.HALF_PI.cosine).toBeCloseTo(0);
    });
    it("PI is π", () => {
      expect(Angle.PI.value).toBeCloseTo(Math.PI);
      expect(Angle.PI.sine).toBeCloseTo(0);
      expect(Angle.PI.cosine).toBeCloseTo(-1);
    });
    it("TWO_PI is 2π", () => {
      expect(Angle.TWO_PI.value).toBeCloseTo(2 * Math.PI);
      expect(Angle.TWO_PI.sine).toBeCloseTo(0);
      expect(Angle.TWO_PI.cosine).toBeCloseTo(1);
    });
  });

  describe("of", () => {
    it("creates angle with cached sin/cos", () => {
      const a = Angle.of(Math.PI / 4);
      expect(a.value).toBeCloseTo(Math.PI / 4);
      expect(a.sine).toBeCloseTo(Math.SQRT1_2);
      expect(a.cosine).toBeCloseTo(Math.SQRT1_2);
    });
  });

  describe("add", () => {
    it("adds number", () => {
      const a = Angle.of(1).add(2);
      expect(a.value).toBeCloseTo(3);
    });
    it("adds Angle", () => {
      const a = Angle.of(1).add(Angle.of(2));
      expect(a.value).toBeCloseTo(3);
    });
  });

  describe("subtract", () => {
    it("subtracts number", () => {
      const a = Angle.of(3).subtract(1);
      expect(a.value).toBeCloseTo(2);
    });
    it("subtracts Angle", () => {
      const a = Angle.of(3).subtract(Angle.of(1));
      expect(a.value).toBeCloseTo(2);
    });
  });

  describe("multiply", () => {
    it("scales angle by factor", () => {
      const a = Angle.of(2).multiply(3);
      expect(a.value).toBeCloseTo(6);
    });
  });

  describe("negated", () => {
    it("returns angle with negated value", () => {
      const angle = Angle.of(1);
      const neg = angle.negated();
      expect(neg.value).toBeCloseTo(-1);
      expect(neg.sine).toBeCloseTo(-angle.sine);
      expect(neg.cosine).toBeCloseTo(angle.cosine);
    });
  });

  describe("complement", () => {
    it("returns π/2 - θ", () => {
      const a = Angle.of(Math.PI / 6);
      const b = a.complement();
      expect(b.value).toBeCloseTo(Math.PI / 3);
      expect(b.sine).toBe(a.cosine);
      expect(b.cosine).toBe(a.sine);
    });
  });

  describe("supplement", () => {
    it("returns π - θ", () => {
      const a = Angle.of(Math.PI / 3);
      const b = a.supplement();
      expect(b.value).toBeCloseTo(2 * Math.PI / 3);
      expect(b.sine).toBe(a.sine);
      expect(b.cosine).toBe(-a.cosine);
    });
  });

  describe("explement", () => {
    it("returns 2π - θ", () => {
      const a = Angle.of(Math.PI / 2);
      const b = a.explement();
      expect(b.value).toBeCloseTo(3 * Math.PI / 2);
      expect(b.sine).toBe(-a.sine);
      expect(b.cosine).toBe(a.cosine);
    });
  });

  describe("halfTurnForward / halfTurnBackward", () => {
    const a = Angle.of(Math.PI / 4);
    it("adds π/2", () => {
      const b = a.halfTurnForward();
      expect(b.value).toBeCloseTo(3 * Math.PI / 4);
      expect(b.sine).toBe(a.cosine);
      expect(b.cosine).toBe(-a.sine);
    });
    it("subtracts π/2", () => {
      const b = a.halfTurnBackward();
      expect(b.value).toBeCloseTo(-Math.PI / 4);
      expect(b.sine).toBe(-a.cosine);
      expect(b.cosine).toBe(a.sine);
    });
  });

  describe("flipForward / flipBackward", () => {
    const a = Angle.of(0.5);
    it("flipForward adds π", () => {
      const b = a.flipForward();
      expect(b.value).toBeCloseTo(0.5 + Math.PI);
      expect(b.sine).toBe(-a.sine);
      expect(b.cosine).toBe(-a.cosine);
    });
    it("flipBackward subtracts π", () => {
      const b = a.flipBackward();
      expect(b.value).toBeCloseTo(0.5 - Math.PI);
      expect(b.sine).toBe(-a.sine);
      expect(b.cosine).toBe(-a.cosine);
    });
  });

  describe("revolveForward / revolveBackward", () => {
    const a = Angle.of(0.5);
    it("revolveForward adds 2π", () => {
      const b = a.revolveForward();
      expect(b.value).toBeCloseTo(0.5 + 2 * Math.PI);
      expect(b.sine).toBe(a.sine);
      expect(b.cosine).toBe(a.cosine);
    });
    it("revolveBackward subtracts 2π", () => {
      const b = a.revolveBackward();
      expect(b.value).toBeCloseTo(0.5 - 2 * Math.PI);
      expect(b.sine).toBe(a.sine);
      expect(b.cosine).toBe(a.cosine);
    });
  });

  describe("toDegrees", () => {
    it("converts radians to degrees", () => {
      expect(Angle.PI.toDegrees()).toBeCloseTo(180);
      expect(Angle.HALF_PI.toDegrees()).toBeCloseTo(90);
      expect(Angle.of(Math.PI / 6).toDegrees()).toBeCloseTo(30);
    });
  });

  describe("valueOf / Symbol.toPrimitive", () => {
    it("returns value for coercion", () => {
      const a = Angle.of(1.5);
      expect(a.valueOf()).toBe(1.5);
      expect(a[Symbol.toPrimitive]()).toBe(1.5);
      expect(Number(a)).toBe(1.5);
      expect(String(a)).toBe("1.5");
    });
  });
});
