import {makePropertiesReadonly} from "./utils/objects.runtime.js";

/** Unforgeable capability token that gates direct construction of {@link Angle}. */
const ANGLE_CONSTRUCTION_LICENSE = Symbol('AngleConstructionLicense');

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

    public add(angle: number | Angle): Angle {
        return Angle.#of(this.value + Number(angle));
    }

    public subtract(angle: number | Angle): Angle {
        return Angle.#of(this.value - Number(angle));
    }

    /** θ × `scalar` */
    public multiply(scalar: number): Angle {
        return Angle.#of(scalar * this.value);
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
    public halfTurnForward() {
        return Angle.#of(
            this.value + Angle.HALF_PI.value,
            this.cosine, -this.sine
        );
    }

    /** θ - π/2. */
    public halfTurnBackward() {
        return Angle.#of(
            this.value - Angle.HALF_PI.value,
            -this.cosine, this.sine
        );
    }

    /** θ + π */
    public flipForward() {
        return Angle.#of(
            this.value + Angle.PI.value,
            -this.sine, -this.cosine
        );
    }

    /** θ - π */
    public flipBackward() {
        return Angle.#of(
            this.value - Angle.PI.value,
            -this.sine, -this.cosine
        );
    }

    /** θ + 2π */
    public revolveForward() {
        return Angle.#of(
            this.value + Angle.TWO_PI.value,
            this.sine, this.cosine
        );
    }

    /** θ - 2π */
    public revolveBackward() {
        return Angle.#of(
            this.value - Angle.TWO_PI.value,
            this.sine, this.cosine
        );
    }

    public toDegrees() {
        return this.value * 180 / Math.PI;
    }

    public valueOf() {
        return this.value;
    }

    [Symbol.toPrimitive]() {
        return this.value;
    }
}

makePropertiesReadonly(Angle, "ZERO", "QUARTER_PI", "HALF_PI", "PI", "TWO_PI");