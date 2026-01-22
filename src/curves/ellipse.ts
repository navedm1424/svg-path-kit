import {Point2D} from "../point2D";
import {Vector2D} from "../vector2D";
import {ParametricCurve2D} from "../parametric-curve-2D";
import {Angle} from "../angle";

/**
 * Parametric ellipse centered at an arbitrary point with tilt.
 */
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

    /** Ellipse center. */
    get center(): Point2D {
        return this._center;
    }
    /** Tilt of the ellipse in radians. */
    get ellipseTilt(): number {
        return this._ellipseTilt;
    }

    /**
     * Factory for creating an {@link Ellipse} optionally specifying its center.
     */
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

    /**
     * Sample the ellipse at an angular parameter.
     */
    public at(angle: number): Point2D {
        return this.center.add(Vector2D.of(
            this.semiMajorAxis * Math.cos(angle),
            this.semiMinorAxis * Math.sin(angle)
        ).rotate(this._ellipseTilt));
    }
    /**
     * Tangent vector at an angular parameter.
     */
    public tangentAt(angle: number): Vector2D {
        return Vector2D.of(
            -this.semiMajorAxis * Math.sin(angle),
            this.semiMinorAxis * Math.cos(angle)
        ).rotate(this._ellipseTilt);
    }
    /**
     * Second derivative at an angular parameter.
     */
    public accelerationAt(angle: number): Vector2D {
        return Vector2D.of(
            -this.semiMajorAxis * Math.cos(angle),
            -this.semiMinorAxis * Math.sin(angle)
        ).rotate(this._ellipseTilt);
    }

    /**
     * Translate the ellipse center by a vector.
     */
    public translate(vector: Vector2D) {
        this._center = this._center.add(vector);
    }
    /**
     * Rotate the ellipse by the given angle.
     */
    public rotate(angle: number) {
        this._ellipseTilt += angle;
    }
}

/**
 * Elliptical arc segment defined by axes, parametric angles, and rotation.
 */
export class EllipticalArc {
    private _ellipseTilt: Angle;
    readonly startAngle: Angle;
    readonly endAngle: Angle;

    /**
     * Construct an elliptical arc with start/end parametric angles and tilt.
     */
    constructor(
        readonly semiMajorAxis: number,
        readonly semiMinorAxis: number,
        startAngle: number | Angle,
        endAngle: number | Angle,
        ellipseTilt: number | Angle = Angle.ZERO
    ) {
        this._ellipseTilt = ellipseTilt instanceof Angle ? ellipseTilt : Angle.of(ellipseTilt);
        this.startAngle = startAngle instanceof Angle ? startAngle : Angle.of(startAngle);
        this.endAngle = endAngle instanceof Angle ? endAngle : Angle.of(endAngle);
    }
    /** Current tilt of the ellipse. */
    get ellipseTilt(): Angle {
        return this._ellipseTilt;
    }

    /** Vector from center to starting point. */
    get startingPointVector(): Vector2D {
        return Vector2D.of(
            this.semiMajorAxis * this.startAngle.cosine,
            this.semiMinorAxis * this.startAngle.sine
        ).rotate(this._ellipseTilt);
    }
    /** Vector from center to ending point. */
    get endingPointVector(): Vector2D {
        return Vector2D.of(
            this.semiMajorAxis * this.endAngle.cosine,
            this.semiMinorAxis * this.endAngle.sine
        ).rotate(this._ellipseTilt);
    }

    /** Tangent at the arc start. */
    get startingTangentVector(): Vector2D {
        return Vector2D.of(
            -this.semiMajorAxis * this.startAngle.sine,
            this.semiMinorAxis * this.startAngle.cosine
        ).rotate(this._ellipseTilt);
    }
    /** Tangent at the arc end. */
    get endingTangentVector(): Vector2D {
        return Vector2D.of(
            -this.semiMajorAxis * this.endAngle.sine,
            this.semiMinorAxis * this.endAngle.cosine
        ).rotate(this._ellipseTilt);
    }

    /**
     * Rotate the underlying ellipse by `angle`.
     */
    public rotate(angle: number | Angle) {
        this._ellipseTilt = this._ellipseTilt.add(angle);
    }
}