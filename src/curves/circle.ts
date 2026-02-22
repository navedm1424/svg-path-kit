import {Point2D} from "../point2D.js";
import {Vector2D} from "../vector2D.js";
import {ParametricCurve2D} from "../parametric-curve-2D.js";
import {Angle} from "../angle.js";
import {makePropertiesReadonly} from "../utils/object-utils.runtime.js";

export class Circle extends ParametricCurve2D {
    #center: Point2D;
    readonly radius: number;

    private constructor(center: Point2D, radius: number) {
        super();
        this.#center = center;
        this.radius = Math.abs(radius);
        makePropertiesReadonly(this, "radius");
    }
    get center(): Point2D {
        return this.#center;
    }

    public static of(radius: number): Circle;
    public static of(center: Point2D, radius: number): Circle;
    public static of(...args: [radius: number] | [center: Point2D, radius: number]): Circle {
        if (args.length === 1)
            return new Circle(Point2D.ORIGIN, args[0]);
        return new Circle(args[0], args[1]);
    }

    public at(angle: number | Angle): Point2D {
        return this.#center.add(Vector2D.polar(this.radius, angle));
    }

    public tangentAt(angle: number | Angle): Vector2D {
        const sine = angle instanceof Angle ? angle.sine : Math.sin(angle);
        const cosine = angle instanceof Angle ? angle.cosine : Math.cos(angle);
        return Vector2D.of(-this.radius * sine, this.radius * cosine);
    }

    public accelerationAt(angle: number | Angle): Vector2D {
        const sine = angle instanceof Angle ? angle.sine : Math.sin(angle);
        const cosine = angle instanceof Angle ? angle.cosine : Math.cos(angle);
        return Vector2D.of(-this.radius * cosine, -this.radius * sine);
    }
    /**
     * Translate the circle center by a vector.
     */
    public translate(vector: Vector2D) {
        this.#center = this.#center.add(vector);
    }
}

/**
 * Circular arc segment described by radius and angular bounds.
 */
export class CircularArc {
    readonly startAngle: Angle;
    readonly endAngle: Angle;
    readonly rotation: Angle;

    /**
     * Define a circular arc between two angles with an optional rotation offset.
     */
    constructor(
        readonly radius: number,
        startAngle: number | Angle,
        endAngle: number | Angle,
        rotation: number | Angle = Angle.ZERO
    ) {
        this.rotation = rotation instanceof Angle ? rotation : Angle.of(rotation);
        this.startAngle = startAngle instanceof Angle ? startAngle : Angle.of(startAngle);
        this.endAngle = endAngle instanceof Angle ? endAngle : Angle.of(endAngle);
        makePropertiesReadonly(this, "radius", "startAngle", "endAngle", "rotation");
    }

    /** Vector from center to starting point in global coordinates. */
    get startingPointVector(): Vector2D {
        return Vector2D.of(
            this.radius * this.startAngle.cosine,
            this.radius * this.startAngle.sine
        ).rotate(this.rotation);
    }
    /** Vector from center to ending point in global coordinates. */
    get endingPointVector(): Vector2D {
        return Vector2D.of(
            this.radius * this.endAngle.cosine,
            this.radius * this.endAngle.sine
        ).rotate(this.rotation);
    }

    /** Tangent vector at the arc start. */
    get startingTangentVector(): Vector2D {
        return Vector2D.of(
            -this.radius * this.startAngle.sine,
            this.radius * this.startAngle.cosine
        ).rotate(this.rotation);
    }
    /** Tangent vector at the arc end. */
    get endingTangentVector(): Vector2D {
        return Vector2D.of(
            -this.radius * this.endAngle.sine,
            this.radius * this.endAngle.cosine
        ).rotate(this.rotation);
    }
}