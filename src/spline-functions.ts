import { PathBuilder } from "./path-builder";
import { Point2D } from "./point2D";
import { Vector2D } from "./vector2D";
import {Curve} from "./curve";
import {CubicBezierCurve} from "./cubic-bezier-curve";

export function fitCurve(curve: Curve, t0: number, t1: number, tolerance: number): CubicBezierCurve[];
export function fitCurve(
    curve: Curve,
    t0: number, t1: number,
    tolerance: number,
    out: CubicBezierCurve[] = []
) {
    const bezier = CubicBezierCurve.fit(curve, t0, t1);

    if (bezier.maxError(curve, t0, t1) < tolerance) {
        out.push(bezier);
        return out;
    }

    // const reverseBezier = CubicBezierCurve.fit(curve, t1, t0);
    // if (reverseBezier.maxError(curve, t1, t0) < tolerance) {
    //     out.push(bezier);
    //     return out;
    // }

    const tm = (t0 + t1) / 2;
    fitCurve(
        curve, t0, tm, tolerance,
        // @ts-expect-error
        out
    );
    fitCurve(
        curve, tm, t1, tolerance,
        // @ts-expect-error
        out
    );
    return out;
}

// export function fitCurveInSteps(
//     curve: Curve,
//     t0: number, t1: number,
//     steps: number
// ) {
//     const range = t1 - t0;
//     const out: CubicBezierCurve[] = [];
//     let prevStep = t0;
//     let currentStep = prevStep;
//     while (currentStep < t1) {
//         prevStep = currentStep;
//         currentStep = currentStep + (1 / steps) * range;
//         out.push(CubicBezierCurve.fit(curve, prevStep, currentStep));
//     }
//     return out;
// }

export function cardinalSpline(
    pb: PathBuilder, tension: number, ...controlPoints: Point2D[]
) {
    let prev: Point2D = pb.currentPosition, next: Point2D, current: Point2D = controlPoints[0];
    let lastVelocity = Vector2D.from(prev, current).scale(2 * tension);
    for (let i = 0; i < controlPoints.length - 1; i++) {
        next = controlPoints[i + 1];
        const currentVelocity = Vector2D.from(prev, next).scale(tension);
        pb.hermiteCurve(
            lastVelocity, currentVelocity,
            current
        );
        lastVelocity = currentVelocity;
        prev = current;
        current = next;
    }
    pb.hermiteCurve(
        lastVelocity, Vector2D.from(prev, current).scale(2 * tension),
        current
    );
}

export function catmullRomSpline(
    pb: PathBuilder, ...controlPoints: Point2D[]
) {
    cardinalSpline(pb, 1 / 2, ...controlPoints);
}