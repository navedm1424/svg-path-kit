import {Vector2D} from "./vector2D";

export class Point2D {
    constructor(readonly x: number, readonly y: number) {
    }

    public static of(x: number, y: number): Point2D {
        return new Point2D(x, y);
    }

    public add(vector: Vector2D): Point2D {
        return new Point2D(this.x + vector.x, this.y + vector.y);
    }

    public toVector(): Vector2D {
        return new Vector2D(this.x, this.y);
    }
}