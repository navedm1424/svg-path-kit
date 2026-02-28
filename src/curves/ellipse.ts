import {Point2D} from "../point2D.js";
import {Vector2D} from "../vector2D.js";
import {ParametricCurve2D} from "../parametric-curve-2D.js";
import {Angle} from "../angle.js";
import {makePropertiesReadonly} from "../utils/object-utils.runtime.js";

/**
 * Parametric ellipse centered at an arbitrary point with tilt.
 */
export class Ellipse extends ParametricCurve2D {
    #center: Point2D;
    #ellipseTilt: Angle;

    private constructor(
        center: Point2D,
        readonly semiMajorAxis: number,
        readonly semiMinorAxis: number,
        ellipseTilt: Angle = Angle.ZERO
    ) {
        super();
        this.#center = center;
        this.#ellipseTilt = ellipseTilt;
        makePropertiesReadonly(this, "semiMajorAxis", "semiMinorAxis");
    }

    get center(): Point2D {
        return this.#center;
    }
    get ellipseTilt(): Angle {
        return this.#ellipseTilt;
    }

    public static of(center: Point2D, semiMajorAxis: number, semiMinorAxis: number, ellipseTilt?: number | Angle): Ellipse;
    public static of(semiMajorAxis: number, semiMinorAxis: number, ellipseTilt?: number | Angle): Ellipse;
    public static of(...args: [
        center: Point2D, semiMajorAxis: number, semiMinorAxis: number, ellipseTilt?: number | Angle
    ] | [
        semiMajorAxis: number, semiMinorAxis: number, ellipseTilt?: number | Angle
    ]) {
        if (args[0] instanceof Point2D && typeof args[2] === "number") {
            const tilt = args[3];
            return new Ellipse(args[0], args[1], args[2], typeof tilt === "number" ? Angle.of(tilt): tilt);
        }
        const tilt = args[2];
        return new Ellipse(Point2D.ORIGIN, args[0] as number, args[1], typeof tilt === "number" ? Angle.of(tilt): tilt);
    }

    public at(angle: number | Angle): Point2D {
        const sine = angle instanceof Angle ? angle.sine : Math.sin(angle);
        const cosine = angle instanceof Angle ? angle.cosine : Math.cos(angle);
        return this.center.add(Vector2D.of(
            this.semiMajorAxis * cosine,
            this.semiMinorAxis * sine
        ).rotate(this.#ellipseTilt));
    }

    public tangentAt(angle: number | Angle): Vector2D {
        const sine = angle instanceof Angle ? angle.sine : Math.sin(angle);
        const cosine = angle instanceof Angle ? angle.cosine : Math.cos(angle);
        return Vector2D.of(
            -this.semiMajorAxis * sine,
            this.semiMinorAxis * cosine
        ).rotate(this.#ellipseTilt);
    }

    public accelerationAt(angle: number | Angle): Vector2D {
        const cosine = angle instanceof Angle ? angle.cosine : Math.cos(angle);
        const sine = angle instanceof Angle ? angle.sine : Math.sin(angle);
        return Vector2D.of(
            -this.semiMajorAxis * cosine,
            -this.semiMinorAxis * sine
        ).rotate(this.#ellipseTilt);
    }

    /** Translate the ellipse center by a vector. */
    public translate(vector: Vector2D) {
        this.#center = this.#center.add(vector);
    }
    public rotate(angle: number | Angle) {
        this.#ellipseTilt = this.#ellipseTilt.add(angle);
    }
}

/**
 * Elliptical arc segment defined by axes, parametric angles, and rotation.
 */
export class EllipticalArc {
    readonly semiMajorAxis: number;
    readonly semiMinorAxis: number;
    readonly startAngle: Angle;
    readonly endAngle: Angle;
    #ellipseTilt: Angle;

    constructor(
        semiMajorAxis: number,
        semiMinorAxis: number,
        startAngle: number | Angle,
        endAngle: number | Angle,
        ellipseTilt: number | Angle = Angle.ZERO
    ) {
        this.semiMajorAxis = Math.abs(semiMajorAxis);
        this.semiMinorAxis = Math.abs(semiMinorAxis);
        this.#ellipseTilt = ellipseTilt instanceof Angle ? ellipseTilt : Angle.of(ellipseTilt);
        this.startAngle = startAngle instanceof Angle ? startAngle : Angle.of(startAngle);
        this.endAngle = endAngle instanceof Angle ? endAngle : Angle.of(endAngle);
        makePropertiesReadonly(this, "semiMajorAxis", "semiMinorAxis", "startAngle", "endAngle");
    }
    get ellipseTilt(): Angle {
        return this.#ellipseTilt;
    }

    /** Vector from center to starting point. */
    get startingPointVector(): Vector2D {
        return Vector2D.of(
            this.semiMajorAxis * this.startAngle.cosine,
            this.semiMinorAxis * this.startAngle.sine
        ).rotate(this.#ellipseTilt);
    }
    /** Vector from center to ending point. */
    get endingPointVector(): Vector2D {
        return Vector2D.of(
            this.semiMajorAxis * this.endAngle.cosine,
            this.semiMinorAxis * this.endAngle.sine
        ).rotate(this.#ellipseTilt);
    }

    /** Tangent at the arc start. */
    get startingTangentVector(): Vector2D {
        return Vector2D.of(
            -this.semiMajorAxis * this.startAngle.sine,
            this.semiMinorAxis * this.startAngle.cosine
        ).rotate(this.#ellipseTilt);
    }
    /** Tangent at the arc end. */
    get endingTangentVector(): Vector2D {
        return Vector2D.of(
            -this.semiMajorAxis * this.endAngle.sine,
            this.semiMinorAxis * this.endAngle.cosine
        ).rotate(this.#ellipseTilt);
    }

    /** Rotate the underlying ellipse by `angle`. */
    public rotate(angle: number | Angle) {
        this.#ellipseTilt = this.#ellipseTilt.add(angle);
    }
}