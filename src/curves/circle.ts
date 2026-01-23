import {Point2D} from "../point2D";
import {Vector2D} from "../vector2D";
import {ParametricCurve2D} from "../parametric-curve-2D";
import {Angle} from "../angle";

/**
 * Parametric circle centered at an arbitrary point.
 */
export class Circle extends ParametricCurve2D {
    private _center: Point2D;
    readonly radius: number;

    private constructor(center: Point2D, radius: number) {
        super();
        this._center = center;
        this.radius = Math.abs(radius);
    }
    /** Center point of the circle. */
    get center(): Point2D {
        return this._center;
    }

    /**
     * Factory for a circle with optional center argument, which defaults to the origin.
     */
    public static of(radius: number): Circle;
    public static of(center: Point2D, radius: number): Circle;
    public static of(...args: [radius: number] | [center: Point2D, radius: number]): Circle {
        if (args.length === 1)
            return new Circle(Point2D.ORIGIN, args[0]);
        return new Circle(args[0], args[1]);
    }

    /**
     * Sample the circle at the provided angular parameter.
     */
    public at(angle: number): Point2D {
        return this._center.add(Vector2D.polar(this.radius, angle));
    }
    /**
     * Tangent vector at the given angular parameter.
     */
    public tangentAt(angle: number): Vector2D {
        return Vector2D.of(-this.radius * Math.sin(angle), this.radius * Math.cos(angle));
    }
    /**
     * Second derivative at the given angular parameter.
     */
    public accelerationAt(t: number): Vector2D {
        return Vector2D.of(-this.radius * Math.cos(t), -this.radius * Math.sin(t));
    }
    /**
     * Translate the circle center by a vector.
     */
    public translate(vector: Vector2D) {
        this._center = this._center.add(vector);
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