import { Vector2D } from "./vector2D";

/**
 * Immutable absolute 2D point with helpers for vector arithmetic.
 */
export class Point2D {
    /** Origin shortcut. */
    public static readonly ORIGIN = Point2D.of(0, 0);

    /**
     * Create a point at the supplied coordinates.
     */
    constructor(readonly x: number, readonly y: number) {
    }

    /**
     * Create a point at the supplied coordinates.
     */
    public static of(x: number, y: number): Point2D {
        return new Point2D(x, y);
    }

    /**
     * Translate the point by the given vector.
     */
    public add(vector: Vector2D): Point2D {
        return new Point2D(this.x + vector.x, this.y + vector.y);
    }

    /**
     * Convert the point coordinates into a vector.
     */
    public toVector(): Vector2D {
        return new Vector2D(this.x, this.y);
    }
}