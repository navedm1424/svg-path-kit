import {makePropertiesReadonly} from "./utils/object-utils";

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
        readonly cosine: number = Math.cos(value)
    ) {
        makePropertiesReadonly(this, "value", "sine", "cosine");
    }

    public static of(value: number) {
        return new Angle(value);
    }

    public add(angle: number | Angle): Angle {
        return Angle.of(this.value + Number(angle));
    }

    public subtract(angle: number | Angle): Angle {
        return Angle.of(this.value - Number(angle));
    }

    /**
     * Scale the angle by a numeric factor.
     */
    public multiply(scalar: number): Angle {
        return Angle.of(scalar * this.value);
    }

    /**
     * Return the negated angle.
     */
    public negated(): Angle {
        return new Angle(
            -this.value,
            -this.sine, this.cosine
        );
    }

    /**
     * Get the complement of an angle (π/2 - θ)
     */
    public complement() {
        return new Angle(
            Angle.HALF_PI.value - this.value,
            this.cosine, this.sine
        );
    }
    /**
     * Get the supplement of an angle (π - θ)
     */
    public supplement() {
        return new Angle(
            Angle.PI.value - this.value,
            this.sine,
            -this.cosine
        );
    }

    /**
     * Get the explement of an angle (2π - θ)
     */
    public explement() {
        return new Angle(
            Angle.TWO_PI.value - this.value,
            -this.sine, this.cosine
        );
    }

    /**
     * Rotate forward by π/2.
     */
    public halfTurnForward() {
        return new Angle(
            this.value + Angle.HALF_PI.value,
            this.cosine, -this.sine
        );
    }

    /**
     * Rotate backward by π/2.
     */
    public halfTurnBackward() {
        return new Angle(
            this.value - Angle.HALF_PI.value,
            -this.cosine, this.sine
        );
    }

    /**
     * Rotate forward by π.
     */
    public flipForward() {
        return new Angle(
            this.value + Angle.PI.value,
            -this.sine, -this.cosine
        );
    }

    /**
     * Rotate backward by π.
     */
    public flipBackward() {
        return new Angle(
            this.value - Angle.PI.value,
            -this.sine, -this.cosine
        );
    }

    /**
     * Rotate forward by a full revolution (2π).
     */
    public revolveForward() {
        return new Angle(
            this.value + Angle.TWO_PI.value,
            this.sine, this.cosine
        );
    }

    /**
     * Rotate backward by a full revolution (2π).
     */
    public revolveBackward() {
        return new Angle(
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
}

makePropertiesReadonly(Angle, "ZERO", "QUARTER_PI", "HALF_PI", "PI", "TWO_PI");