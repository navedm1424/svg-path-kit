import { Point2D } from "./point2D";
import {Angle} from "./angle";

/**
 * Mutable 2D vector with geometric helpers and conversion utilities.
 */
export class Vector2D {
    private _magnitude: number;

    /** Shared null vector instance. */
    static readonly NULL_VECTOR = new Vector2D(0, 0);

    /**
     * Create a vector with the provided coordinates.
     */
    constructor(private _x: number, private _y: number) {
        this._magnitude = Math.hypot(_x, _y);
    }

    /** X component. */
    get x() {
        return this._x;
    }
    /** Y component. */
    get y() {
        return this._y;
    }
    /** Euclidean length. */
    get magnitude() {
        return this._magnitude;
    }
    /** Slope y/x. */
    get slope() {
        return this._y / this._x;
    }
    /** Polar angle in radians. */
    get angle() {
        return Math.atan2(this._y, this._x);
    }

    /**
     * Create a vector with the provided coordinates.
     */
    public static of(x: number, y: number): Vector2D {
        return new Vector2D(x, y);
    }

    /**
     * Create a vector from polar coordinates—`radius` and `angle`.
     */
    public static polar(radius: number, angle: number | Angle): Vector2D {
        if (angle instanceof Angle)
            return new Vector2D(radius * angle.cosine, radius * angle.sine);
        return new Vector2D(radius * Math.cos(angle), radius * Math.sin(angle));
    }

    /**
     * Construct a vector from `initialPoint` to `terminalPoint`.
     */
    public static from(initialPoint: Point2D, terminalPoint: Point2D): Vector2D {
        return new Vector2D(terminalPoint.x - initialPoint.x, terminalPoint.y - initialPoint.y);
    }

    /**
     * Add another vector and return the sum as a new instance.
     */
    public add(vector: Vector2D) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    /**
     * Subtract another vector and return the difference as a new instance.
     */
    public subtract(vector: Vector2D) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    /**
     * Compute the unsigned angle with another vector
     */
    public angleWith(vector: Vector2D): number {
        return Math.acos(this.dotProduct(vector) / (this._magnitude * vector._magnitude));
    }

    /**
     * Compute the singed angle with another vector
     */
    public singedAngleWith(vector: Vector2D): number {
        return Math.atan2(this.crossProduct(vector), this.dotProduct(vector));
    }

    /**
     * Dot product with another vector.
     */
    public dotProduct(vector: Vector2D) {
        return this.x * vector.x + this.y * vector.y;
    }

    /**
     * Scalar cross product with another vector.
     */
    public crossProduct(vector: Vector2D): number {
        return this.x * vector.y - this.y * vector.x;
    }

    /**
     * Return the normalized vector or `Vector2D.NULL_VECTOR` if magnitude is 0.
     */
    public normalize(): Vector2D {
        if (this._magnitude === 0)
            return Vector2D.NULL_VECTOR;
        return new Vector2D(this.x / this._magnitude, this.y / this._magnitude);
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

    /**
     * Return the vector pointing in the opposite direction—the negated vector.
     */
    public opposite(): Vector2D {
        return new Vector2D(-this.x, -this.y);
    }

    /**
     * Create a copy of this vector.
     */
    public clone(): Vector2D {
        return new Vector2D(this.x, this.y);
    }

    /**
     * Scale the vector in-place by `scalar`.
     */
    public scale(scalar: number): this {
        this._x *= scalar;
        this._y *= scalar;
        this._magnitude = Math.hypot(this.x, this.y);
        return this;
    }

    /**
     * Rotate the vector in-place by `angle` radians.
     */
    public rotate(angle: number | Angle): this {
        const sine = angle instanceof Angle ? angle.sine : Math.sin(angle);
        const cosine = angle instanceof Angle ? angle.cosine : Math.cos(angle);
        const newX = this._x * cosine - this._y * sine;
        const newY = this._x * sine + this._y * cosine;
        this._x = newX;
        this._y = newY;
        return this;
    }

    /**
     * Convert to a {@link Point2D} with the same coordinates.
     */
    public toPoint(): Point2D {
        return new Point2D(this.x, this.y);
    }
}
