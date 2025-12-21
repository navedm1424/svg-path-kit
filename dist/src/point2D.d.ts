import { Vector2D } from "./vector2D";
export declare class Point2D {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
    static of(x: number, y: number): Point2D;
    add(vector: Vector2D): Point2D;
    toVector(): Vector2D;
}
