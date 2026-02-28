import {PathBuilder} from "./path-builder.js";
import {Point2D} from "./point2D.js";
import {Vector2D} from "./vector2D.js";
import {ParametricCurve2D} from "./parametric-curve-2D.js";
import {findRoots, round} from "./numbers/index.js";
import {CubicBezierCurve, fitCubicBezier} from "./cubic-bezier-curve.js";
import {CubicBezierCurveCommand, CubicBezierHermiteCurveCommand} from "./path.js";

const roundingOrder = 8;

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

function cubicBezierFitRadialError(
    bezierFit: CubicBezierCurve,
    targetCurve: ParametricCurve2D,
    t0: number, t1: number,
    samples = 10
): number {
    let maxError = 0;

    for (let i = 0; i <= samples; i++) {
        const t = t0 + (i / samples) * (t1 - t0);

        const b = bezierFit.at(t);
        const c = targetCurve.at(t);

        const dx = b.x - c.x;
        const dy = b.y - c.y;

        const error = Math.hypot(dx, dy);
        if (error > maxError)
            maxError = error;
    }

    return maxError;
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
    const bezier = fitCubicBezier(curve, t0, t1);

    if (cubicBezierFitRadialError(bezier, curve, t0, t1) < tolerance) {
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
        const bezier = fitCubicBezier(curve, prevStep, currentStep);
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
        const bezier = fitCubicBezier(curve, ts[i - 1]!, ts[i]!);
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

    return fitSplineAtParams(pb, curve, criciticalPoints[0]!, criciticalPoints[1]!, ...criciticalPoints.slice(2));
}

/**
 * Build a Cardinal spline through provided control points.
 */
export function cardinalSpline(
    pb: PathBuilder, tension: number, ...controlPoints: Point2D[]
) {
    const spline: CubicBezierHermiteCurveCommand[] = [];
    if (controlPoints.length === 0)
        return [];

    let prev: Point2D = pb.currentPosition, next: Point2D, current: Point2D = controlPoints[0]!;
    let lastVelocity = Vector2D.from(prev, current).scale(2 * tension);
    for (let i = 1; i < controlPoints.length; i++) {
        next = controlPoints[i]!;
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