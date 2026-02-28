import {Vector2D} from "./vector2D.js";
import {Point2D} from "./point2D.js";
import {ParametricCurve2D} from "./parametric-curve-2D.js";
import {makePropertiesReadonly} from "./utils/object-utils.runtime.js";

export class CubicBezierCurve extends ParametricCurve2D {
    constructor(
        readonly startingPoint: Point2D,
        readonly firstControlPoint: Point2D,
        readonly secondControlPoint: Point2D,
        readonly endingPoint: Point2D
    ) {
        super();
        makePropertiesReadonly(this, "startingPoint", "firstControlPoint", "secondControlPoint", "endingPoint");
    }

    public at(t: number): Point2D {
        const u = 1 - t;
        const P0 = this.startingPoint;
        const P1 = this.firstControlPoint;
        const P2 = this.secondControlPoint;
        const P3 = this.endingPoint;

        return Point2D.of(
            u * u * u * P0.x +
            3 * u * u * t * P1.x +
            3 * u * t * t * P2.x +
            t * t * t * P3.x,

            u * u * u * P0.y +
            3 * u * u * t * P1.y +
            3 * u * t * t * P2.y +
            t * t * t * P3.y
        );
    }

    public tangentAt(t: number): Vector2D {
        const u = 1 - t;
        const P0 = this.startingPoint;
        const P1 = this.firstControlPoint;
        const P2 = this.secondControlPoint;
        const P3 = this.endingPoint;

        return Vector2D.of(
            3 * u * u * (P1.x - P0.x) +
            6 * u * t * (P2.x - P1.x) +
            3 * t * t * (P3.x - P2.x),

            3 * u * u * (P1.y - P0.y) +
            6 * u * t * (P2.y - P1.y) +
            3 * t * t * (P3.y - P2.y)
        );
    }

    public accelerationAt(t: number) {
        const u = 1 - t;
        const P0 = this.startingPoint;
        const P1 = this.firstControlPoint;
        const P2 = this.secondControlPoint;
        const P3 = this.endingPoint;

        return Vector2D.of(
            6 * (P2.x - 2 * P1.x + P0.x) * u +
            6 * (P3.x - 2 * P2.x + P1.x) * t,

            6 * (P2.y - 2 * P1.y + P0.y) * u +
            6 * (P3.y - 2 * P2.y + P1.y) * t,
        );
    }
}

const equalityThreshold = 1e-8;

/** Compute a cubic Bézier that best matches the source curve over [t0, t1]. */
export function fitCubicBezier(
    curve: ParametricCurve2D,
    t0: number, t1: number
) {
    const p0 = curve.at(t0);
    const p3 = curve.at(t1);
    const p0Vec = p0.toVector();
    const p3Vec = p3.toVector();
    const midPoint = curve.at((t0 + t1) / 2).toVector();
    if (![p0.x, p0.y, p3.x, p3.y, midPoint.x, midPoint.y].every(Number.isFinite))
        throw new Error("The curve is not defined at all points.");

    const v0 = curve.tangentAt(t0);
    const v1 = curve.tangentAt(t1);
    if (![v0.x, v0.y, v1.x, v1.y].every(Number.isFinite))
        throw new Error("The tangent is not defined at all points of the curve.");

    const v0Unit = v0.normalize();
    const v1Unit = v1.normalize();
    const R = (
        midPoint.scale(2)
            .subtract(p0Vec)
            .subtract(p3Vec)
    ).scale(4 / 3);
    const c = v0Unit.dotProduct(v1Unit);
    const denominator = 1 - c * c;
    if (Math.abs(denominator) < equalityThreshold) {
        const scale = (t1 - t0) / 3;
        return new CubicBezierCurve(
            p0,
            p0.add(v0.scale(scale)),
            p3.add(v1.scale(-scale)),
            p3
        );
    }

    const s0 = (R.dotProduct(v0Unit) - c * (R.dotProduct(v1Unit))) / denominator;
    const s1 = (c * R.dotProduct(v0Unit) - (R.dotProduct(v1Unit))) / denominator;

    return new CubicBezierCurve(
        p0,
        p0.add(v0Unit.scale(s0)),
        p3.add(v1Unit.scale(-s1)),
        p3
    );
}