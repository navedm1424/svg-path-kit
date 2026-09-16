import {makePropertiesReadonly} from "./utils/objects.runtime.js";

/** Unforgeable capability token that gates direct construction of {@link Angle}. */
const ANGLE_CONSTRUCTION_LICENSE = Symbol('AngleConstructionLicense');

const DEG = Math.PI / 180;
const GRAD = Math.PI / 200;
const TURN = 2 * Math.PI;

const DEG_INVERSE = 1 / DEG;
const GRAD_INVERSE = 1 / GRAD;
const TURN_INVERSE = 1 / TURN;

/**
 * Immutable wrapper around an angle value that caches its sine and cosine
 * and offers helpers for common rotations.
 */
export class Angle {
    public static readonly ZERO = Angle.of(0);
    public static readonly QUARTER_PI = Angle.of(Math.PI / 4);
    public static readonly HALF_PI = Angle.of(Math.PI / 2);
    public static readonly PI = Angle.of(Math.PI);
    public static readonly TWO_PI = Angle.of(2 * Math.PI);

    private constructor(
        readonly value: number,
        readonly sine: number = Math.sin(value),
        readonly cosine: number = Math.cos(value),
        license?: typeof ANGLE_CONSTRUCTION_LICENSE
    ) {
        if (license !== ANGLE_CONSTRUCTION_LICENSE)
            throw new Error('Illegal constructor: use the factory method.');

        makePropertiesReadonly(this, "value", "sine", "cosine");
    }

    static #of(value: number, sine: number = Math.sin(value), cosine: number = Math.cos(value)) {
        return new Angle(value, sine, cosine, ANGLE_CONSTRUCTION_LICENSE);
    }

    public static of(value: number) {
        return Angle.#of(value);
    }

    /** Builds an {@link Angle} from a value in degrees. */
    public static deg(value: number): Angle {
        return Angle.of(value * DEG);
    }

    /** Builds an {@link Angle} from a value in gradians (400 grad = 2π rad). */
    public static grad(value: number): Angle {
        return Angle.of(value * GRAD);
    }

    /** Builds an {@link Angle} from a value in turns (1 turn = 2π rad). */
    public static turn(value: number): Angle {
        return Angle.of(value * TURN);
    }

    public plus(delta: number | Angle): Angle {
        return Angle.#of(this.value + Number(delta));
    }

    public minus(delta: number | Angle): Angle {
        return Angle.#of(this.value - Number(delta));
    }

    /** θ × `scalar` */
    public multiply(scalar: number): Angle {
        return Angle.#of(scalar * this.value);
    }

    /** θ ÷ `scalar` */
    public divide(scalar: number): Angle {
        return Angle.#of(this.value / scalar);
    }

    /** Applies `fn` to the underlying radian value and wraps the result back into an {@link Angle}. */
    public map(fn: (value: number) => number): Angle {
        return Angle.#of(fn(this.value));
    }

    /** -θ (negated angle) */
    public negated() {
        return Angle.#of(
            -this.value,
            -this.sine, this.cosine
        );
    }

    /** π/2 - θ (complement of the angle) */
    public complement() {
        return Angle.#of(
            Angle.HALF_PI.value - this.value,
            this.cosine, this.sine
        );
    }
    /** π - θ (supplement of the angle) */
    public supplement() {
        return Angle.#of(
            Angle.PI.value - this.value,
            this.sine,
            -this.cosine
        );
    }

    /** 2π - θ (explement of the angle) */
    public explement() {
        return Angle.#of(
            Angle.TWO_PI.value - this.value,
            -this.sine, this.cosine
        );
    }

    /** θ + π/2 */
    public plusHalfPi() {
        return Angle.#of(
            this.value + Angle.HALF_PI.value,
            this.cosine, -this.sine
        );
    }

    /** θ - π/2. */
    public minusHalfPi() {
        return Angle.#of(
            this.value - Angle.HALF_PI.value,
            -this.cosine, this.sine
        );
    }

    /** θ + π */
    public plusPi() {
        return Angle.#of(
            this.value + Angle.PI.value,
            -this.sine, -this.cosine
        );
    }

    /** θ - π */
    public minusPi() {
        return Angle.#of(
            this.value - Angle.PI.value,
            -this.sine, -this.cosine
        );
    }

    /** θ + 2π */
    public plusTwoPi() {
        return Angle.#of(
            this.value + Angle.TWO_PI.value,
            this.sine, this.cosine
        );
    }

    /** θ - 2π */
    public minusTwoPi() {
        return Angle.#of(
            this.value - Angle.TWO_PI.value,
            this.sine, this.cosine
        );
    }

    /** Normalizes θ into `[0, 2π)`. */
    public wrap(): Angle {
        const twoPi = Angle.TWO_PI.value;
        return Angle.#of(((this.value % twoPi) + twoPi) % twoPi);
    }

    /** Normalizes θ into `[-π, π)`. */
    public wrapSigned(): Angle {
        const twoPi = Angle.TWO_PI.value;
        const pi = Angle.PI.value;
        return Angle.#of((((this.value + pi) % twoPi) + twoPi) % twoPi - pi);
    }

    public toDeg() {
        return this.value * DEG_INVERSE;
    }
    public toGrad() {
        return this.value * GRAD_INVERSE;
    }
    public toTurn() {
        return this.value * TURN_INVERSE;
    }

    /** Whether `this` and `other` are equal within `epsilon` radians. */
    public equals(other: number | Angle, epsilon: number = 1e-9): boolean {
        return Math.abs(this.value - Number(other)) <= epsilon;
    }

    [Symbol.toPrimitive]() {
        return this.value;
    }
}

makePropertiesReadonly(Angle, "ZERO", "QUARTER_PI", "HALF_PI", "PI", "TWO_PI");