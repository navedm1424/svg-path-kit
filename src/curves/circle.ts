import {Point2D} from "../point2D";
import {Vector2D} from "../vector2D";
import {ParametricCurve2D} from "../parametric-curve-2D";

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
    private readonly _startingPointVector: Vector2D;
    private readonly _endingPointVector: Vector2D;

    constructor(
        readonly radius: number,
        readonly startAngle: number,
        readonly endAngle: number,
        readonly rotation: number = 0
    ) {
        const startAngleSine = Math.sin(startAngle);
        const startAngleCosine = Math.cos(startAngle);
        const endAngleSine = Math.sin(endAngle);
        const endAngleCosine = Math.cos(endAngle);
        this._startingPointVector = Vector2D.of(
            radius * startAngleCosine,
            radius * startAngleSine
        );
        this._startingPointVector.rotate(rotation);
        this._endingPointVector = Vector2D.of(
            radius * endAngleCosine,
            radius * endAngleSine
        );
        this._endingPointVector.rotate(rotation);
    }

    get startingPointVector(): Vector2D {
        return this._startingPointVector.clone();
    }
    get endingPointVector(): Vector2D {
        return this._endingPointVector.clone();
    }

    get startingTangentVector(): Vector2D {
        return this._startingPointVector.perpendicular();
    }
    get endingTangentVector(): Vector2D {
        return this._endingPointVector.perpendicular();
    }
}