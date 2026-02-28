import { Vector2D } from "./vector2D.js";
import {makePropertiesReadonly} from "./utils/object-utils.runtime.js";

/**
 * Immutable absolute 2D point with helpers for vector arithmetic.
 */
export class Point2D {
    public static readonly ORIGIN = Point2D.of(0, 0);

    constructor(readonly x: number, readonly y: number) {
        makePropertiesReadonly(this, "x", "y");
    }

    public static of(x: number, y: number): Point2D {
        return new Point2D(x, y);
    }

    /** Translate the point by the given vector. */
    public add(vector: Vector2D): Point2D {
        return new Point2D(this.x + vector.x, this.y + vector.y);
    }

    public toVector(): Vector2D {
        return new Vector2D(this.x, this.y);
    }
}

makePropertiesReadonly(Point2D, "ORIGIN");