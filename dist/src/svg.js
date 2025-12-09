export class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static of(x, y) {
        return new Point2D(x, y);
    }
    add(vector) {
        return new Point2D(this.x + vector.x, this.y + vector.y);
    }
    toVector() {
        return new Vector2D(this.x, this.y);
    }
}
export var RotationDirection;
(function (RotationDirection) {
    RotationDirection[RotationDirection["CLOCKWISE"] = 0] = "CLOCKWISE";
    RotationDirection[RotationDirection["COUNTERCLOCKWISE"] = 1] = "COUNTERCLOCKWISE";
})(RotationDirection || (RotationDirection = {}));
;
export class Vector2D {
    constructor(_x, _y) {
        this._x = _x;
        this._y = _y;
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
    static of(x, y) {
        return new Vector2D(x, y);
    }
    static ofAngle(angle) {
        return new Vector2D(Math.cos(angle), Math.sin(angle));
    }
    static from(initialPoint, terminalPoint) {
        return new Vector2D(terminalPoint.x - initialPoint.x, terminalPoint.y - initialPoint.y);
    }
    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }
    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    dotProduct(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    crossProduct(vector) {
        return this.x * vector.y - this.y * vector.x;
    }
    unit() {
        if (this._magnitude === 0)
            return Vector2D.NULL_VECTOR;
        return new Vector2D(this.x / this._magnitude, this.y / this._magnitude);
    }
    perpendicular(rotationDirection = RotationDirection.COUNTERCLOCKWISE) {
        return RotationDirection.COUNTERCLOCKWISE === rotationDirection ?
            new Vector2D(-1 * this.y, this.x) :
            new Vector2D(this.y, -1 * this.x);
    }
    opposite() {
        return new Vector2D(-this.x, -this.y);
    }
    clone() {
        return new Vector2D(this.x, this.y);
    }
    scale(scalar) {
        this._x *= scalar;
        this._y *= scalar;
        this._magnitude = Math.hypot(this.x, this.y);
    }
    rotate(angle) {
        const sine = Math.sin(angle);
        const cosine = Math.cos(angle);
        const newX = this.x * cosine - this.y * sine;
        const newY = this.x * sine + this.y * cosine;
        this._x = newX;
        this._y = newY;
    }
    toPoint() {
        return new Point2D(this.x, this.y);
    }
}
Vector2D.NULL_VECTOR = new Vector2D(0, 0);
;
