import { Vector2D } from "./vector2D";

/**
 * Immutable absolute 2D point with helpers for vector arithmetic.
 */
export class Point2D {
    public static readonly ORIGIN = Point2D.of(0, 0);

    constructor(readonly x: number, readonly y: number) {
        Object.defineProperties(this, {
            x: { value: x, writable: false, configurable: false },
            y: { value: y, writable: false, configurable: false }
        });
    }

    public static of(x: number, y: number): Point2D {
        return new Point2D(x, y);
    }

    /**
     * Translate the point by the given vector.
     */
    public add(vector: Vector2D): Point2D {
        return new Point2D(this.x + vector.x, this.y + vector.y);
    }

    public toVector(): Vector2D {
        return new Vector2D(this.x, this.y);
    }
}

Object.defineProperty(Point2D, "ORIGIN", {
    value: Point2D.ORIGIN,
    writable: false,
    configurable: false
});