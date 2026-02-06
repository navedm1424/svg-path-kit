import {PathBuilder} from "./path-builder";
import {Point2D} from "./point2D";
import {Vector2D} from "./vector2D";
import {ParametricCurve2D} from "./parametric-curve-2D";
import {findRoots, round} from "./numbers/index";
import {CubicBezierCurve} from "./cubic-bezier-curve";
import {CubicBezierCurveCommand, CubicBezierHermiteCurveCommand} from "./path";

const roundingOrder = 8;
const equalityThreshold = 1e-8;

/**
 * Collect parameter values where a parametric curve has extrema or inflection points.
 */
export function findCriticalTs(curve: ParametricCurve2D, tStart: number, tEnd: number) {
    const criticalTs = new Set<number>();

    // Coordinate extrema
    // Cusps where the roots coincide
    const addToSet = (t: number) => criticalTs.add(round(t, roundingOrder));
    findRoots((t: number) => curve.tangentAt(t).x, tStart, tEnd).forEach(addToSet);
    findRoots((t: number) => curve.tangentAt(t).y, tStart, tEnd).forEach(addToSet);

    // Radial derivatives
    // findRoots((t: number) => {
    //     const posVec = curve.at(t).toVector();
    //     const tangent = curve.tangentAt(t);
    //     return posVec.dotProduct(tangent) / posVec.magnitude;
    // }, tStart, tEnd).forEach(addToSet);
    // findRoots(
    //     (t: number) => curve.at(t).toVector().crossProduct(curve.tangentAt(t)),
    //     tStart, tEnd
    // ).forEach(addToSet);

    // Inflections (curvature = 0)
    findRoots((t: number) => {
        const tangent = curve.tangentAt(t);
        const acceleration = curve.accelerationAt(t);
        return tangent.crossProduct(acceleration) / Math.pow(tangent.magnitude, 3);
    }, tStart, tEnd).forEach(addToSet);

    return Array.from(criticalTs).sort((a, b) => a - b);
}

/**
 * Encapsulates a cubic Bézier approximation of a curve segment.
 */
export class CubicBezierFit {
    readonly cubicBezierCurve: CubicBezierCurve;

    constructor(
        readonly targetParametricCurve: ParametricCurve2D,
        readonly segmentStart: number,
        readonly segmentEnd: number
    ) {
        this.cubicBezierCurve = CubicBezierFit.fit(targetParametricCurve, segmentStart, segmentEnd);
    }

    /**
     * Compute a cubic Bézier that best matches the source curve over [t0, t1].
     */
    private static fit(
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

    /**
     * Measure maximum radial error against the source curve by sampling.
     */
    public radialError(samples = 10): number {
        let maxError = 0;

        for (let i = 0; i <= samples; i++) {
            const t = this.segmentStart + (i / samples) * (this.segmentEnd - this.segmentStart);

            const b = this.cubicBezierCurve.at(t);
            const c = this.targetParametricCurve.at(t);

            const dx = b.x - c.x;
            const dy = b.y - c.y;

            const error = Math.hypot(dx, dy);
            if (error > maxError)
                maxError = error;
        }

        return maxError;
    }
}

/**
 * Recursively subdivide the curve and fit cubic Bézier segments to them until the error tolerance is met.
 */
export function fitSplineBySubdivision(
    pb: PathBuilder,
    curve: ParametricCurve2D,
    t0: number, t1: number,
    tolerance: number = 0.25
): CubicBezierCurveCommand[] {
    const spline: CubicBezierCurveCommand[] = [];
    fitSplineBySubdivisionInternal(pb, curve, t0, t1, tolerance, spline);
    return spline;
}
function fitSplineBySubdivisionInternal(
    pb: PathBuilder,
    curve: ParametricCurve2D,
    t0: number, t1: number,
    tolerance: number = 0.25,
    spline: CubicBezierCurveCommand[]
) {
    const bezierFit = new CubicBezierFit(curve, t0, t1);

    if (bezierFit.radialError() < tolerance) {
        const bezier = bezierFit.cubicBezierCurve;
        spline.push(pb.c(
            Vector2D.from(bezier.startingPoint, bezier.firstControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.secondControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.endingPoint)
        ));
        return;
    }

    const tm = (t0 + t1) / 2;
    fitSplineBySubdivisionInternal(
        pb, curve, t0, tm, tolerance, spline
    );
    fitSplineBySubdivisionInternal(
        pb, curve, tm, t1, tolerance, spline
    );
}

/**
 * Fit cubic Bézier segments in fixed parameter steps.
 */
export function fitSplineInSteps(
    pb: PathBuilder,
    curve: ParametricCurve2D,
    t0: number, t1: number,
    steps: number
) {
    const range = t1 - t0;
    let prevStep = t0;
    let currentStep = prevStep;
    const spline: CubicBezierCurveCommand[] = [];
    while (Math.abs(t1 - currentStep) > 1e-4) {
        prevStep = currentStep;
        currentStep = currentStep + (1 / steps) * range;
        const bezier = new CubicBezierFit(curve, prevStep, currentStep).cubicBezierCurve;
        spline.push(pb.c(
            Vector2D.from(bezier.startingPoint, bezier.firstControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.secondControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.endingPoint)
        ));
    }
    return spline;
}

/**
 * Fit cubic Bézier pieces between explicit parameter breakpoints.
 */
export function fitSplineAtParams(pb: PathBuilder, curve: ParametricCurve2D, ...ts: [number, number, ...number[]]) {
    const spline: CubicBezierCurveCommand[] = [];
    for (let i = 1; i < ts.length; i++) {
        const bezier = new CubicBezierFit(curve, ts[i - 1], ts[i])
            .cubicBezierCurve;
        spline.push(pb.c(
            Vector2D.from(bezier.startingPoint, bezier.firstControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.secondControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.endingPoint)
        ));
    }
    return spline;
}

/**
 * Fit a spline through a curve segment at its critical parameter values (extrema and inflection points).
 */
export function fitSplineTo(pb: PathBuilder, curve: ParametricCurve2D, t0: number, t1: number) {
    let criciticalPoints = findCriticalTs(curve, t0, t1);
    if (criciticalPoints.length < 2)
        return fitSplineAtParams(pb, curve, t0, t1);

    return fitSplineAtParams(pb, curve, criciticalPoints[0], criciticalPoints[1], ...criciticalPoints.slice(2));
}

/**
 * Build a Cardinal spline through provided control points.
 */
export function cardinalSpline(
    pb: PathBuilder, tension: number, ...controlPoints: Point2D[]
) {
    const spline: CubicBezierHermiteCurveCommand[] = [];
    let prev: Point2D = pb.currentPosition, next: Point2D, current: Point2D = controlPoints[0];
    let lastVelocity = Vector2D.from(prev, current).scale(2 * tension);
    for (let i = 0; i < controlPoints.length - 1; i++) {
        next = controlPoints[i + 1];
        const currentVelocity = Vector2D.from(prev, next).scale(tension);
        spline.push(pb.hermiteCurve(
            lastVelocity, currentVelocity,
            current
        ));
        lastVelocity = currentVelocity;
        prev = current;
        current = next;
    }
    spline.push(pb.hermiteCurve(
        lastVelocity, Vector2D.from(prev, current).scale(2 * tension),
        current
    ));
    return spline;
}

/**
 * Convenience function for a Catmull-Rom spline (Cardinal with tension 0.5).
 */
export function catmullRomSpline(
    pb: PathBuilder, ...controlPoints: Point2D[]
) {
    return cardinalSpline(pb, 1 / 2, ...controlPoints);
}