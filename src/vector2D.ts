import { Point2D } from "./point2D.js";
import {Angle} from "./angle.js";
import {makePropertiesReadonly} from "./utils/object-utils.runtime.js";

/**
 * Mutable 2D vector with geometric helpers and conversion utilities.
 */
export class Vector2D {
    #x: number;
    #y: number;
    #magnitude: number;

    public static readonly NULL_VECTOR = new Vector2D(0, 0);

    constructor(x: number, y: number) {
        this.#x = x;
        this.#y = y;
        this.#magnitude = Math.hypot(x, y);
    }

    get x() {
        return this.#x;
    }
    get y() {
        return this.#y;
    }
    get magnitude() {
        return this.#magnitude;
    }
    get slope() {
        return this.#y / this.#x;
    }
    get angle() {
        return Math.atan2(this.#y, this.#x);
    }

    public static of(x: number, y: number): Vector2D {
        return new Vector2D(x, y);
    }

    /** Vector from polar coordinates—`radius` and `angle` */
    public static polar(radius: number, angle: number | Angle): Vector2D {
        if (angle instanceof Angle)
            return new Vector2D(radius * angle.cosine, radius * angle.sine);
        return new Vector2D(radius * Math.cos(angle), radius * Math.sin(angle));
    }

    /** Vector from `initialPoint` to `terminalPoint` */
    public static from(initialPoint: Point2D, terminalPoint: Point2D): Vector2D {
        return new Vector2D(terminalPoint.x - initialPoint.x, terminalPoint.y - initialPoint.y);
    }

    public add(vector: Vector2D) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    public subtract(vector: Vector2D) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    public angleWith(vector: Vector2D): number {
        return Math.acos(this.dotProduct(vector) / (this.#magnitude * vector.#magnitude));
    }

    public singedAngleWith(vector: Vector2D): number {
        return Math.atan2(this.crossProduct(vector), this.dotProduct(vector));
    }

    public dotProduct(vector: Vector2D) {
        return this.x * vector.x + this.y * vector.y;
    }

    /** Scalar cross product with another vector. */
    public crossProduct(vector: Vector2D): number {
        return this.x * vector.y - this.y * vector.x;
    }

    /** Return the normalized vector or `Vector2D.NULL_VECTOR` if magnitude is 0. */
    public normalize(): Vector2D {
        if (this.#magnitude === 0)
            return Vector2D.NULL_VECTOR;
        return new Vector2D(this.x / this.#magnitude, this.y / this.#magnitude);
    }

    /**
     * Return a perpendicular vector; orientation controls clockwise/counter-clockwise.
     *
     * `orientation` specifies the orientation of rotation for perpendicular vectors:
     * - `1 (default)`—specifying clockwise in SVG's coordinate system.
     * - `-1`—specifying counter-clockwise in SVG's coordinate system.
     *
     * > Note: SVG uses a top-left origin with a downward-increasing y-axis, which inverts orientation semantics compared to the conventional mathematical Cartesian system.
     * In the conventional Cartesian system, a positive orientation would correspond to counterclockwise and a negative orientation would correspond to clockwise.
     * Perpendicular vectors can also be obtained using the `rotate` method with angles of `±Math.PI / 2`.
     */
    public perpendicular(orientation: 1 | -1 = 1): Vector2D {
        let sign = Math.sign(orientation);
        sign = sign === 0 ? 1 : sign;
        return new Vector2D(sign * -1 * this.y, sign * this.x);
    }

    public opposite(): Vector2D {
        return new Vector2D(-this.x, -this.y);
    }

    public clone(): Vector2D {
        return new Vector2D(this.x, this.y);
    }

    /** Scale the vector in-place by `scalar`. */
    public scale(scalar: number): this {
        this.#x *= scalar;
        this.#y *= scalar;
        this.#magnitude = Math.hypot(this.x, this.y);
        return this;
    }

    /** Rotate the vector in-place by `angle` radians. */
    public rotate(angle: number | Angle): this {
        const sine = angle instanceof Angle ? angle.sine : Math.sin(angle);
        const cosine = angle instanceof Angle ? angle.cosine : Math.cos(angle);
        const newX = this.#x * cosine - this.#y * sine;
        const newY = this.#x * sine + this.#y * cosine;
        this.#x = newX;
        this.#y = newY;
        return this;
    }

    public toPoint(): Point2D {
        return new Point2D(this.#x, this.#y);
    }
}

makePropertiesReadonly(Vector2D, "NULL_VECTOR");