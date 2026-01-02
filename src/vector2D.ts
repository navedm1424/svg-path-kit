import { Point2D } from "./point2D";

export enum Orientation {
    CLOCKWISE, COUNTERCLOCKWISE
};

export class Vector2D {
    private _magnitude: number;

    static readonly NULL_VECTOR = new Vector2D(0, 0);

    constructor(private _x: number, private _y: number) {
        this._magnitude = Math.hypot(_x, _y);
    }

    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get magnitude() {
        return this._magnitude;
    }
    get slope() {
        return this._y / this._x;
    }
    get angle() {
        return Math.atan2(this._y, this._x);
    }

    public static of(x: number, y: number): Vector2D {
        return new Vector2D(x, y);
    }

    public static polar(radius: number, angle: number): Vector2D {
        return new Vector2D(radius * Math.cos(angle), radius * Math.sin(angle));
    }

    public static from(initialPoint: Point2D, terminalPoint: Point2D): Vector2D {
        return new Vector2D(terminalPoint.x - initialPoint.x, terminalPoint.y - initialPoint.y);
    }

    public add(vector: Vector2D) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    public subtract(vector: Vector2D) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    public dotProduct(vector: Vector2D) {
        return this.x * vector.x + this.y * vector.y;
    }

    public crossProduct(vector: Vector2D): number {
        return this.x * vector.y - this.y * vector.x;
    }    

    public unit(): Vector2D {
        if (this._magnitude === 0)
            return Vector2D.NULL_VECTOR;
        return new Vector2D(this.x / this._magnitude, this.y / this._magnitude);
    }

    public perpendicular(orientation: Orientation = Orientation.COUNTERCLOCKWISE): Vector2D {
        return Orientation.COUNTERCLOCKWISE === orientation ?
            new Vector2D(-1 * this.y, this.x):
            new Vector2D(this.y, -1 * this.x);
    }

    public opposite(): Vector2D {
        return new Vector2D(-this.x, -this.y);
    }

    public clone(): Vector2D {
        return new Vector2D(this.x, this.y);
    }

    public scale(scalar: number): this {
        this._x *= scalar;
        this._y *= scalar;
        this._magnitude = Math.hypot(this.x, this.y);
        return this;
    }

    public rotate(angle: number): this {
        const sine = Math.sin(angle);
        const cosine = Math.cos(angle);
        const newX = this.x * cosine - this.y * sine;
        const newY = this.x * sine + this.y * cosine;
        this._x = newX;
        this._y = newY;
        return this;
    }

    public toPoint(): Point2D {
        return new Point2D(this.x, this.y);
    }
};