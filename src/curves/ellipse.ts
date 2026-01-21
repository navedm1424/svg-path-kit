import {Point2D} from "../point2D";
import {Vector2D} from "../vector2D";
import {ParametricCurve2D} from "../parametric-curve-2D";
import {Angle} from "../angle";

export class Ellipse extends ParametricCurve2D {
    private _center: Point2D;
    private _ellipseTilt: number;
    readonly focalDistance: number;

    private constructor(
        center: Point2D,
        readonly semiMajorAxis: number,
        readonly semiMinorAxis: number,
        ellipseTilt: number = 0
    ) {
        super();
        this._center = center;
        this._ellipseTilt = ellipseTilt;
        this.focalDistance = Math.sqrt(Math.pow(semiMajorAxis, 2) - Math.pow(semiMinorAxis, 2));
    }

    get center(): Point2D {
        return this._center;
    }
    get ellipseTilt(): number {
        return this._ellipseTilt;
    }

    public static of(center: Point2D, semiMajorAxis: number, semiMinorAxis: number, ellipseTilt?: number): Ellipse;
    public static of(semiMajorAxis: number, semiMinorAxis: number, ellipseTilt?: number): Ellipse;
    public static of(...args: [
        center: Point2D, semiMajorAxis: number, semiMinorAxis: number, ellipseTilt?: number
    ] | [
        semiMajorAxis: number, semiMinorAxis: number, ellipseTilt?: number
    ]) {
        if (typeof args[0] === "number")
            return new Ellipse(Point2D.ORIGIN, args[0], args[1], args[2]);
        return new Ellipse(args[0], args[1], args[2]!, args[3]);
    }

    public at(angle: number): Point2D {
        return this.center.add(Vector2D.of(
            this.semiMajorAxis * Math.cos(angle),
            this.semiMinorAxis * Math.sin(angle)
        ).rotate(this._ellipseTilt));
    }
    public tangentAt(angle: number): Vector2D {
        return Vector2D.of(
            -this.semiMajorAxis * Math.sin(angle),
            this.semiMinorAxis * Math.cos(angle)
        ).rotate(this._ellipseTilt);
    }
    public accelerationAt(angle: number): Vector2D {
        return Vector2D.of(
            -this.semiMajorAxis * Math.cos(angle),
            -this.semiMinorAxis * Math.sin(angle)
        ).rotate(this._ellipseTilt);
    }

    public translate(vector: Vector2D) {
        this._center = this._center.add(vector);
    }
    public rotate(angle: number) {
        this._ellipseTilt += angle;
    }
}

export class EllipticalArc {
    private _ellipseTilt: number;
    readonly startAngle: Angle;
    readonly endAngle: Angle;

    constructor(
        readonly semiMajorAxis: number,
        readonly semiMinorAxis: number,
        startAngle: number | Angle,
        endAngle: number | Angle,
        ellipseTilt: number = 0
    ) {
        this._ellipseTilt = ellipseTilt;
        this.startAngle = startAngle instanceof Angle ? startAngle : Angle.of(startAngle);
        this.endAngle = endAngle instanceof Angle ? endAngle : Angle.of(endAngle);
    }
    get ellipseTilt(): number {
        return this._ellipseTilt;
    }

    get startingPointVector(): Vector2D {
        return Vector2D.of(
            this.semiMajorAxis * this.startAngle.cosine,
            this.semiMinorAxis * this.startAngle.sine
        ).rotate(this._ellipseTilt);
    }
    get endingPointVector(): Vector2D {
        return Vector2D.of(
            this.semiMajorAxis * this.endAngle.cosine,
            this.semiMinorAxis * this.endAngle.sine
        ).rotate(this._ellipseTilt);
    }

    get startingTangentVector(): Vector2D {
        return Vector2D.of(
            -this.semiMajorAxis * this.startAngle.sine,
            this.semiMinorAxis * this.startAngle.cosine
        ).rotate(this._ellipseTilt);
    }
    get endingTangentVector(): Vector2D {
        return Vector2D.of(
            -this.semiMajorAxis * this.endAngle.sine,
            this.semiMinorAxis * this.endAngle.cosine
        ).rotate(this._ellipseTilt);
    }

    public rotate(angle: number) {
        this._ellipseTilt += angle;
    }
}