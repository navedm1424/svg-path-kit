import {Point2D} from "./point2D";

export enum RotationDirection {
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

    public static of(x: number, y: number): Vector2D {
        return new Vector2D(x, y);
    }

    public static ofAngle(angle: number): Vector2D {
        return new Vector2D(Math.cos(angle), Math.sin(angle));
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

    public multiply(scalar: number) {
        return new Vector2D(this.x * scalar, this.y * scalar);
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

    public perpendicular(rotationDirection: RotationDirection = RotationDirection.COUNTERCLOCKWISE): Vector2D {
        return RotationDirection.COUNTERCLOCKWISE === rotationDirection ?
            new Vector2D(-1 * this.y, this.x):
            new Vector2D(this.y, -1 * this.x);
    }

    public opposite(): Vector2D {
        return new Vector2D(-this.x, -this.y);
    }

    public clone(): Vector2D {
        return new Vector2D(this.x, this.y);
    }

    public scale(scalar: number): void {
        this._x *= scalar;
        this._y *= scalar;
        this._magnitude = Math.hypot(this.x, this.y);
    }

    public rotate(angle: number): void {
        const sine = Math.sin(angle);
        const cosine = Math.cos(angle);
        const newX = this.x * cosine - this.y * sine;
        const newY = this.x * sine + this.y * cosine;
        this._x = newX;
        this._y = newY;
    }

    public toPoint(): Point2D {
        return new Point2D(this.x, this.y);
    }
};