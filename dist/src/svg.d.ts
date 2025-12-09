export declare class Point2D {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
    static of(x: number, y: number): Point2D;
    add(vector: Vector2D): Point2D;
    toVector(): Vector2D;
}
export declare enum RotationDirection {
    CLOCKWISE = 0,
    COUNTERCLOCKWISE = 1
}
export declare class Vector2D {
    private _x;
    private _y;
    private _magnitude;
    static readonly NULL_VECTOR: Vector2D;
    constructor(_x: number, _y: number);
    get x(): number;
    get y(): number;
    get magnitude(): number;
    get slope(): number;
    static of(x: number, y: number): Vector2D;
    static ofAngle(angle: number): Vector2D;
    static from(initialPoint: Point2D, terminalPoint: Point2D): Vector2D;
    add(vector: Vector2D): Vector2D;
    subtract(vector: Vector2D): Vector2D;
    multiply(scalar: number): Vector2D;
    dotProduct(vector: Vector2D): number;
    crossProduct(vector: Vector2D): number;
    unit(): Vector2D;
    perpendicular(rotationDirection?: RotationDirection): Vector2D;
    opposite(): Vector2D;
    clone(): Vector2D;
    scale(scalar: number): void;
    rotate(angle: number): void;
    toPoint(): Point2D;
}
