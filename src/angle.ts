/**
 * Immutable wrapper around an angle value that caches its sine and cosine
 * and offers helpers for common rotations.
 */
export class Angle {
    readonly sine: number;
    readonly cosine: number;

    /** Pre-constructed angle of 0 radians. */
    public static readonly ZERO = Angle.of(0);
    /** Pre-constructed angle of π/4 radians. */
    public static readonly QUARTER_PI = Angle.of(Math.PI / 4);
    /** Pre-constructed angle of π/2 radians. */
    public static readonly HALF_PI = Angle.of(Math.PI / 2);
    /** Pre-constructed angle of π radians. */
    public static readonly PI = Angle.of(Math.PI);
    /** Pre-constructed angle of 2π radians. */
    public static readonly TWO_PI = Angle.of(2 * Math.PI);

    /**
        * Create a new angle instance and cache its sine and cosine.
        * @param value Angle in radians.
        */
    constructor(readonly value: number) {
        this.sine = Math.sin(value);
        this.cosine = Math.cos(value);
    }

    /**
     * Factory for constructing an {@link Angle} from a radian value.
     */
    public static of(value: number) {
        return new Angle(value);
    }

    /**
     * Return a new angle offset by the provided amount.
     */
    public add(angle: number | Angle): Angle {
        return Angle.of(this.value + (angle instanceof Angle ? angle.value : angle));
    }

    /**
     * Return a new angle reduced by the provided amount.
     */
    public subtract(angle: number | Angle): Angle {
        return Angle.of(this.value - (angle instanceof Angle ? angle.value : angle));
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
    public negative(): Angle {
        return Angle.of(-this.value);
    }

    /**
     * Rotate forward by π/2.
     */
    public turnForward() {
        return Angle.of(this.value + Angle.HALF_PI.value);
    }

    /**
     * Rotate backward by π/2.
     */
    public turnBackward() {
        return Angle.of(this.value - Angle.HALF_PI.value);
    }

    /**
     * Rotate forward by π.
     */
    public flipForward() {
        return Angle.of(this.value + Angle.PI.value);
    }

    /**
     * Rotate backward by π.
     */
    public flipBackward() {
        return Angle.of(this.value - Angle.PI.value);
    }

    /**
     * Rotate forward by a full revolution (2π).
     */
    public revolveForward() {
        return Angle.of(this.value + Angle.TWO_PI.value);
    }

    /**
     * Rotate backward by a full revolution (2π).
     */
    public revolveBackward() {
        return Angle.of(this.value - Angle.TWO_PI.value);
    }
}