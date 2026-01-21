import {Point2D} from "../point2D";
import {Vector2D} from "../vector2D";
import {ParametricCurve2D} from "../parametric-curve-2D";
import {Angle} from "../angle";

export class Circle extends ParametricCurve2D {
    private _center: Point2D;

    private constructor(center: Point2D, readonly radius: number) {
        super();
        this._center = center;
    }
    get center(): Point2D {
        return this._center;
    }

    public static of(radius: number): Circle;
    public static of(center: Point2D, radius: number): Circle;
    public static of(...args: [radius: number] | [center: Point2D, radius: number]): Circle {
        if (args.length === 1)
            return new Circle(Point2D.ORIGIN, args[0]);
        return new Circle(args[0], args[1]);
    }

    public at(angle: number): Point2D {
        return this._center.add(Vector2D.polar(this.radius, angle));
    }
    public tangentAt(angle: number): Vector2D {
        return Vector2D.of(-this.radius * Math.sin(angle), this.radius * Math.cos(angle));
    }
    public accelerationAt(t: number): Vector2D {
        return Vector2D.of(-this.radius * Math.cos(t), -this.radius * Math.sin(t));
    }
    public translate(vector: Vector2D) {
        this._center = this._center.add(vector);
    }
}

export class CircularArc {
    readonly startAngle: Angle;
    readonly endAngle: Angle;

    constructor(
        readonly radius: number,
        startAngle: number | Angle,
        endAngle: number | Angle,
        readonly rotation: number = 0
    ) {
        this.startAngle = startAngle instanceof Angle ? startAngle : Angle.of(startAngle);
        this.endAngle = endAngle instanceof Angle ? endAngle : Angle.of(endAngle);
    }

    get startingPointVector(): Vector2D {
        return Vector2D.of(
            this.radius * this.startAngle.cosine,
            this.radius * this.startAngle.sine
        ).rotate(this.rotation);
    }
    get endingPointVector(): Vector2D {
        return Vector2D.of(
            this.radius * this.endAngle.cosine,
            this.radius * this.endAngle.sine
        ).rotate(this.rotation);
    }

    get startingTangentVector(): Vector2D {
        return Vector2D.of(
            -this.radius * this.startAngle.sine,
            this.radius * this.startAngle.cosine
        ).rotate(this.rotation);
    }
    get endingTangentVector(): Vector2D {
        return Vector2D.of(
            -this.radius * this.endAngle.sine,
            this.radius * this.endAngle.cosine
        ).rotate(this.rotation);
    }
}