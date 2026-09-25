import { describe, it, expect } from "vitest";
import { Angle } from "../src/angle.js";

describe("Angle", () => {
  describe("construction", () => {
    it("rejects direct construction that bypasses the factory", () => {
      const AngleCtor = Angle as unknown as new (value: number) => Angle;
      expect(() => new AngleCtor(1)).toThrow(/Illegal constructor/);
    });
  });

  describe("static constants", () => {
    it("ZERO has value 0", () => {
      expect(Angle.ZERO.value).toBe(0);
      expect(Angle.ZERO.sin).toBe(0);
      expect(Angle.ZERO.cos).toBe(1);
    });
    it("HALF_PI is π/2", () => {
      expect(Angle.HALF_PI.value).toBeCloseTo(Math.PI / 2);
      expect(Angle.HALF_PI.sin).toBeCloseTo(1);
      expect(Angle.HALF_PI.cos).toBeCloseTo(0);
    });
    it("PI is π", () => {
      expect(Angle.PI.value).toBeCloseTo(Math.PI);
      expect(Angle.PI.sin).toBeCloseTo(0);
      expect(Angle.PI.cos).toBeCloseTo(-1);
    });
    it("TWO_PI is 2π", () => {
      expect(Angle.TWO_PI.value).toBeCloseTo(2 * Math.PI);
      expect(Angle.TWO_PI.sin).toBeCloseTo(0);
      expect(Angle.TWO_PI.cos).toBeCloseTo(1);
    });
  });

  describe("of", () => {
    it("creates angle with cached sin/cos", () => {
      const a = Angle.of(Math.PI / 4);
      expect(a.value).toBeCloseTo(Math.PI / 4);
      expect(a.sin).toBeCloseTo(Math.SQRT1_2);
      expect(a.cos).toBeCloseTo(Math.SQRT1_2);
    });
  });

  describe("deg", () => {
    it("builds an angle from degrees", () => {
      expect(Angle.deg(180).value).toBeCloseTo(Math.PI);
      expect(Angle.deg(90).value).toBeCloseTo(Math.PI / 2);
      expect(Angle.deg(30).value).toBeCloseTo(Math.PI / 6);
    });
  });

  describe("grad", () => {
    it("builds an angle from gradians", () => {
      expect(Angle.grad(200).value).toBeCloseTo(Math.PI);
      expect(Angle.grad(100).value).toBeCloseTo(Math.PI / 2);
      expect(Angle.grad(400).value).toBeCloseTo(2 * Math.PI);
    });
  });

  describe("turn", () => {
    it("builds an angle from turns", () => {
      expect(Angle.turn(1).value).toBeCloseTo(2 * Math.PI);
      expect(Angle.turn(0.5).value).toBeCloseTo(Math.PI);
      expect(Angle.turn(0.25).value).toBeCloseTo(Math.PI / 2);
    });
  });

  describe("add", () => {
    it("adds number", () => {
      const a = Angle.of(1).plus(2);
      expect(a.value).toBeCloseTo(3);
    });
    it("adds Angle", () => {
      const a = Angle.of(1).plus(Angle.of(2));
      expect(a.value).toBeCloseTo(3);
    });
  });

  describe("subtract", () => {
    it("subtracts number", () => {
      const a = Angle.of(3).minus(1);
      expect(a.value).toBeCloseTo(2);
    });
    it("subtracts Angle", () => {
      const a = Angle.of(3).minus(Angle.of(1));
      expect(a.value).toBeCloseTo(2);
    });
  });

  describe("multiply", () => {
    it("scales angle by factor", () => {
      const a = Angle.of(2).multiply(3);
      expect(a.value).toBeCloseTo(6);
    });
  });

  describe("divide", () => {
    it("scales angle by 1/scalar", () => {
      const a = Angle.of(6).divide(3);
      expect(a.value).toBeCloseTo(2);
    });
  });

  describe("map", () => {
    it("applies fn to the underlying value and rewraps it", () => {
      const a = Angle.of(1).map((v) => v * 2);
      expect(a.value).toBeCloseTo(2);
      expect(a.sin).toBeCloseTo(Math.sin(2));
      expect(a.cos).toBeCloseTo(Math.cos(2));
    });
  });

  describe("negated", () => {
    it("returns angle with negated value", () => {
      const angle = Angle.of(1);
      const neg = angle.negate();
      expect(neg.value).toBeCloseTo(-1);
      expect(neg.sin).toBeCloseTo(-angle.sin);
      expect(neg.cos).toBeCloseTo(angle.cos);
    });
  });

  describe("complement", () => {
    it("returns π/2 - θ", () => {
      const a = Angle.of(Math.PI / 6);
      const b = a.complement();
      expect(b.value).toBeCloseTo(Math.PI / 3);
      expect(b.sin).toBe(a.cos);
      expect(b.cos).toBe(a.sin);
    });
  });

  describe("supplement", () => {
    it("returns π - θ", () => {
      const a = Angle.of(Math.PI / 3);
      const b = a.supplement();
      expect(b.value).toBeCloseTo(2 * Math.PI / 3);
      expect(b.sin).toBe(a.sin);
      expect(b.cos).toBe(-a.cos);
    });
  });

  describe("explement", () => {
    it("returns 2π - θ", () => {
      const a = Angle.of(Math.PI / 2);
      const b = a.explement();
      expect(b.value).toBeCloseTo(3 * Math.PI / 2);
      expect(b.sin).toBe(-a.sin);
      expect(b.cos).toBe(a.cos);
    });
  });

  describe("halfTurnForward / halfTurnBackward", () => {
    const a = Angle.of(Math.PI / 4);
    it("adds π/2", () => {
      const b = a.plusHalfPi();
      expect(b.value).toBeCloseTo(3 * Math.PI / 4);
      expect(b.sin).toBe(a.cos);
      expect(b.cos).toBe(-a.sin);
    });
    it("subtracts π/2", () => {
      const b = a.minusHalfPi();
      expect(b.value).toBeCloseTo(-Math.PI / 4);
      expect(b.sin).toBe(-a.cos);
      expect(b.cos).toBe(a.sin);
    });
  });

  describe("flipForward / flipBackward", () => {
    const a = Angle.of(0.5);
    it("flipForward adds π", () => {
      const b = a.plusPi();
      expect(b.value).toBeCloseTo(0.5 + Math.PI);
      expect(b.sin).toBe(-a.sin);
      expect(b.cos).toBe(-a.cos);
    });
    it("flipBackward subtracts π", () => {
      const b = a.minusPi();
      expect(b.value).toBeCloseTo(0.5 - Math.PI);
      expect(b.sin).toBe(-a.sin);
      expect(b.cos).toBe(-a.cos);
    });
  });

  describe("revolveForward / revolveBackward", () => {
    const a = Angle.of(0.5);
    it("revolveForward adds 2π", () => {
      const b = a.plusTwoPi();
      expect(b.value).toBeCloseTo(0.5 + 2 * Math.PI);
      expect(b.sin).toBe(a.sin);
      expect(b.cos).toBe(a.cos);
    });
    it("revolveBackward subtracts 2π", () => {
      const b = a.minusTwoPi();
      expect(b.value).toBeCloseTo(0.5 - 2 * Math.PI);
      expect(b.sin).toBe(a.sin);
      expect(b.cos).toBe(a.cos);
    });
  });

  describe("wrap", () => {
    it("normalizes a value above π into [-π, π)", () => {
      expect(Angle.of(3 * Math.PI / 2).wrap().value).toBeCloseTo(-Math.PI / 2);
    });
    it("normalizes a negative value below -π into [-π, π)", () => {
      expect(Angle.of(-3 * Math.PI / 2).wrap().value).toBeCloseTo(Math.PI / 2);
    });
    it("leaves an in-range value unchanged", () => {
      expect(Angle.of(Math.PI / 4).wrap().value).toBeCloseTo(Math.PI / 4);
    });
  });

  describe("wrap(1) (positive sweep)", () => {
    it("normalizes a value above 2π into [0, 2π)", () => {
      expect(Angle.of(3 * Math.PI).wrap(1).value).toBeCloseTo(Math.PI);
    });
    it("normalizes a negative value into [0, 2π)", () => {
      expect(Angle.of(-Math.PI / 2).wrap(1).value).toBeCloseTo(3 * Math.PI / 2);
    });
    it("leaves an in-range value unchanged", () => {
      expect(Angle.of(Math.PI / 3).wrap(1).value).toBeCloseTo(Math.PI / 3);
    });
  });

  describe("wrap(-1) (negative sweep)", () => {
    it("normalizes a value above 0 into (-2π, 0]", () => {
      expect(Angle.of(Math.PI / 2).wrap(-1).value).toBeCloseTo(Math.PI / 2 - 2 * Math.PI);
    });
    it("normalizes a value below -2π into (-2π, 0]", () => {
      expect(Angle.of(-5 * Math.PI / 2).wrap(-1).value).toBeCloseTo(-Math.PI / 2);
    });
    it("leaves zero unchanged", () => {
      expect(Angle.of(0).wrap(-1).value).toBe(0);
    });
  });

  describe("toDeg / toGrad / toTurn", () => {
    it("converts radians to degrees", () => {
      expect(Angle.PI.toDeg()).toBeCloseTo(180);
      expect(Angle.HALF_PI.toDeg()).toBeCloseTo(90);
      expect(Angle.of(Math.PI / 6).toDeg()).toBeCloseTo(30);
    });
    it("converts radians to gradians", () => {
      expect(Angle.PI.toGrad()).toBeCloseTo(200);
      expect(Angle.HALF_PI.toGrad()).toBeCloseTo(100);
      expect(Angle.TWO_PI.toGrad()).toBeCloseTo(400);
    });
    it("converts radians to turns", () => {
      expect(Angle.TWO_PI.toTurn()).toBeCloseTo(1);
      expect(Angle.PI.toTurn()).toBeCloseTo(0.5);
      expect(Angle.HALF_PI.toTurn()).toBeCloseTo(0.25);
    });
  });

  describe("equals", () => {
    it("returns true for equal angles", () => {
      expect(Angle.of(1).equals(Angle.of(1))).toBe(true);
    });
    it("returns true when compared against a raw number", () => {
      expect(Angle.of(1).equals(1)).toBe(true);
    });
    it("returns false for angles outside the default epsilon", () => {
      expect(Angle.of(1).equals(1.1)).toBe(false);
    });
    it("respects a custom epsilon", () => {
      expect(Angle.of(1).equals(1.05, 0.1)).toBe(true);
      expect(Angle.of(1).equals(1.2, 0.1)).toBe(false);
    });
  });

  describe("valueOf / Symbol.toPrimitive", () => {
    it("returns value for coercion", () => {
      const a = Angle.of(1.5);
      expect(+a).toBe(1.5);
      expect(a[Symbol.toPrimitive]()).toBe(1.5);
      expect(Number(a)).toBe(1.5);
      expect(String(a)).toBe("1.5");
    });
  });
});
