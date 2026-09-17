import {Point2D} from "./point2D.js";
import {Angle} from "./angle.js";
import {makePropertiesReadonly} from "./utils/objects.runtime.js";

/** Unforgeable capability token that gates direct construction of {@link Vector2D}. */
const VECTOR2D_CONSTRUCTION_LICENSE = Symbol('Vector2DConstructionLicense');

/**
 * Mutable 2D vector with geometric helpers and conversion utilities.
 *
 * > Note: SVG uses a top-left origin with a downward-increasing y-axis, which inverts sweep semantics compared to the conventional mathematical Cartesian system.
 * In the conventional Cartesian system, a positive sweep would correspond to counter-clockwise and a negative sweep would correspond to clockwise.
 */
export class Vector2D {
    #x: number;
    #y: number;
    #length: number;
    #angle: Angle;

    public static readonly NULL_VECTOR = Vector2D.#of(0, 0, 0, Angle.ZERO);

    private constructor(
        x: number, y: number,
        length: number = Math.hypot(x, y),
        angle: Angle = Angle.of(Math.atan2(y, x)),
        license?: typeof VECTOR2D_CONSTRUCTION_LICENSE
    ) {
        if (license !== VECTOR2D_CONSTRUCTION_LICENSE)
            throw new Error('Illegal constructor: use the factory method.');

        this.#x = x;
        this.#y = y;
        this.#length = length;
        this.#angle = angle;
    }

    static #of(x: number, y: number, length?: number, angle?: Angle) {
        return new Vector2D(x, y, length, angle, VECTOR2D_CONSTRUCTION_LICENSE);
    }

    get x() {
        return this.#x;
    }
    get y() {
        return this.#y;
    }
    get length() {
        return this.#length;
    }
    get slope() {
        return this.#y / this.#x;
    }
    get angle() {
        return this.#angle;
    }

    public static of(x: number, y: number = x): Vector2D {
        return Vector2D.#of(x, y);
    }

    /** Vector from polar coordinates—`radius` and `angle` */
    public static polar(radius: number, angle: number | Angle): Vector2D {
        const effectiveAngle = angle instanceof Angle ? angle : Angle.of(angle);
        return Vector2D.#of(
            radius * effectiveAngle.cos,
            radius * effectiveAngle.sin,
            Math.abs(radius),
            radius < 0 ? effectiveAngle.plusPi() : effectiveAngle
        );
    }

    /** Chord vector on a circle from `initialAngle` to `terminalAngle`. */
    public static chord(
        radius: number,
        initialAngle: number | Angle,
        terminalAngle: number | Angle
    ): Vector2D {
        const a = initialAngle instanceof Angle ? initialAngle : Angle.of(initialAngle);
        const b = terminalAngle instanceof Angle ? terminalAngle : Angle.of(terminalAngle);

        const x = radius * (b.cos - a.cos);
        const y = radius * (b.sin - a.sin);
        const length = Math.hypot(x, y);

        if (length === 0)
            return Vector2D.NULL_VECTOR;

        const midpoint = a.map(aValue => (b.value + aValue) / 2).wrap();

        // Picks whichever of the two perpendicular candidates actually points along (x, y);
        // self-correcting even if `midpoint` landed on the opposite side of the wrap (i.e. off by π),
        // since {midpoint + π/2, midpoint - π/2} is invariant under midpoint -> midpoint + π.
        const angle = (x * -midpoint.sin + y * midpoint.cos) > 0
            ? midpoint.plusHalfPi()
            : midpoint.minusHalfPi();

        return Vector2D.#of(x, y, length, angle);
    }

    /** Vector from `initialPoint` to `terminalPoint` */
    public static from(initialPoint: Point2D, terminalPoint: Point2D): Vector2D {
        return Vector2D.#of(terminalPoint.x - initialPoint.x, terminalPoint.y - initialPoint.y);
    }

    public add(vector: Vector2D) {
        return Vector2D.#of(this.#x + vector.#x, this.#y + vector.#y);
    }

    public subtract(vector: Vector2D) {
        return Vector2D.#of(this.#x - vector.#x, this.#y - vector.#y);
    }

    /** Signed angle in `(-π, π]` radians from this vector to `other`, positive clockwise and negative counter-clockwise. */
    public angleWith(other: Vector2D): Angle;
    /** Signed angle from this vector to `other`, swept in the given direction: `1` for clockwise (range `[0, 2π)`), `-1` for counter-clockwise (range `(-2π, 0]`). */
    public angleWith(other: Vector2D, sweep: 1 | -1): Angle;
    public angleWith(other: Vector2D, sweep?: 1 | -1): Angle {
        const angle = Angle.of(Math.atan2(this.crossProduct(other), this.dotProduct(other)));
        if (sweep === undefined)
            return angle;
        if (sweep > 0)
            return angle.value < 0 ? angle.plusTwoPi() : angle;
        return angle.value > 0 ? angle.minusTwoPi() : angle;
    }

    public dotProduct(vector: Vector2D) {
        return this.#x * vector.#x + this.#y * vector.#y;
    }

    /** Scalar cross product with another vector. */
    public crossProduct(vector: Vector2D): number {
        return this.#x * vector.#y - this.#y * vector.#x;
    }

    /** Return the normalized vector or `Vector2D.NULL_VECTOR` if magnitude is 0. */
    public normalize(): Vector2D {
        if (this.#length === 0)
            return Vector2D.NULL_VECTOR;
        return Vector2D.#of(this.#x / this.#length, this.#y / this.#length, 1, this.#angle);
    }

    /**
     * Return a perpendicular vector; sweep controls clockwise/counter-clockwise.
     *
     * `sweep` specifies the sweep direction of rotation for perpendicular vectors:
     * - `1 (default)`—specifying clockwise in SVG's coordinate system.
     * - `-1`—specifying counter-clockwise in SVG's coordinate system.
     *
     * > Perpendicular vectors can also be obtained using the `rotate` method with angles of `±Math.PI / 2`.
     */
    public perpendicular(sweep: 1 | -1 = 1): Vector2D {
        let sign = Math.sign(sweep);
        sign = sign === 0 ? 1 : sign;
        return Vector2D.#of(
            sign * -1 * this.#y, sign * this.#x,
            this.#length, sign === 1 ? this.#angle.plusHalfPi() : this.#angle.minusHalfPi()
        );
    }

    public opposite(): Vector2D {
        return Vector2D.#of(-this.#x, -this.#y, this.#length, this.#angle.plusPi());
    }

    public clone(): Vector2D {
        return Vector2D.#of(this.#x, this.#y, this.#length, this.#angle);
    }

    /** Scale the vector in-place by `scalar`. */
    public scale(scalar: number): this {
        this.#x *= scalar;
        this.#y *= scalar;
        this.#length *= Math.abs(scalar);
        if (scalar < 0)
            this.#angle = this.#angle.plusPi();
        return this;
    }

    /** Rotate the vector in-place by `angle` radians. */
    public rotate(angle: number | Angle): this {
        const sine = angle instanceof Angle ? angle.sin : Math.sin(angle);
        const cosine = angle instanceof Angle ? angle.cos : Math.cos(angle);
        const newX = this.#x * cosine - this.#y * sine;
        const newY = this.#x * sine + this.#y * cosine;
        this.#x = newX;
        this.#y = newY;
        this.#angle = this.#angle.plus(angle);
        return this;
    }

    public toPoint(): Point2D {
        return new Point2D(this.#x, this.#y);
    }
}

makePropertiesReadonly(Vector2D, "NULL_VECTOR");