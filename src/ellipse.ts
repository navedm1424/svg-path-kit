import {Point2D} from "./point2D";
import {Vector2D} from "./vector2D";

export class Ellipse {
    private _center: Point2D;
    private _ellipseTilt: number;
    readonly focalDistance: number;

    constructor(
        center: Point2D,
        readonly semiMajorAxis: number,
        readonly semiMinorAxis: number,
        ellipseTilt: number
    ) {
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

    public getPointAtParametricAngle(angle: number): Point2D {
        const vector = Vector2D.of(this.semiMajorAxis * Math.cos(angle), this.semiMinorAxis * Math.sin(angle));
        vector.rotate(this._ellipseTilt);
        return this.center.add(vector);
    }
    public getTangentAtParametricAngle(angle: number): Vector2D {
        const vector = Vector2D.of(-this.semiMajorAxis * Math.sin(angle), this.semiMinorAxis * Math.cos(angle));
        vector.rotate(this._ellipseTilt);
        return vector;
    }
    public translate(vector: Vector2D) {
        this._center = this._center.add(vector);
    }
    public rotate(angle: number) {
        this._ellipseTilt += angle;
    }
}

export class EllipticalArc {
    private readonly _startingPointVector: Vector2D;
    private readonly _endingPointVector: Vector2D;
    private readonly _startingTangentVector: Vector2D;
    private readonly _endingTangentVector: Vector2D;
    private _ellipseTilt: number;

    constructor(
        readonly semiMajorAxis: number,
        readonly semiMinorAxis: number,
        readonly startAngle: number,
        readonly endAngle: number,
        ellipseTilt: number = 0
    ) {
        this._ellipseTilt = ellipseTilt;
        const startAngleSine = Math.sin(startAngle);
        const startAngleCosine = Math.cos(startAngle);
        const endAngleSine = Math.sin(endAngle);
        const endAngleCosine = Math.cos(endAngle);
        this._startingPointVector = Vector2D.of(
            semiMajorAxis * startAngleCosine,
            semiMinorAxis * startAngleSine
        );
        this._startingPointVector.rotate(ellipseTilt);
        this._endingPointVector = Vector2D.of(
            semiMajorAxis * endAngleCosine,
            semiMinorAxis * endAngleSine
        );
        this._endingPointVector.rotate(ellipseTilt);
        this._startingTangentVector = Vector2D.of(
            -semiMajorAxis * startAngleSine,
            semiMinorAxis * startAngleCosine
        );
        this._startingTangentVector.rotate(ellipseTilt);
        this._endingTangentVector = Vector2D.of(
            -semiMajorAxis * endAngleSine,
            semiMinorAxis * endAngleCosine
        );
        this._endingTangentVector.rotate(ellipseTilt);
    }
    get ellipseTilt(): number {
        return this._ellipseTilt;
    }

    get startingPointVector(): Vector2D {
        return this._startingPointVector.clone();
    }
    get endingPointVector(): Vector2D {
        return this._endingPointVector.clone();
    }

    get startingTangentVector(): Vector2D {
        return this._startingTangentVector.clone();
    }
    get endingTangentVector(): Vector2D {
        return this._endingTangentVector.clone();
    }

    public rotate(angle: number) {
        this._ellipseTilt += angle;
        this._startingPointVector.rotate(angle);
        this._endingPointVector.rotate(angle);
        this._startingTangentVector.rotate(angle);
        this._endingTangentVector.rotate(angle);
    }
}