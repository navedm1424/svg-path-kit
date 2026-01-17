import {PathBuilder} from "./path-builder";
import {Point2D} from "./point2D";
import {Vector2D} from "./vector2D";
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
    const isValid = !Number.isNaN(bezier.firstControlPoint.x) && !Number.isNaN(bezier.firstControlPoint.y)
        && !Number.isNaN(bezier.secondControlPoint.x) && !Number.isNaN(bezier.secondControlPoint.y);

    if (isValid && bezier.maxError(curve, t0, t1) < tolerance) {
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

export function fitCurveAtParams(curve: Curve, ...ts: number[]) {
    const out: CubicBezierCurve[] = [];
    for (let i = 1; i < ts.length; i++)
        out.push(CubicBezierCurve.fit(curve, ts[i - 1], ts[i]));
    return out;
}

export function fitCurveInSteps(
    curve: Curve,
    t0: number, t1: number,
    steps: number
) {
    const range = t1 - t0;
    const out: CubicBezierCurve[] = [];
    let prevStep = t0;
    let currentStep = prevStep;
    while (Math.abs(t1 - currentStep) > 1e-4) {
        prevStep = currentStep;
        currentStep = currentStep + (1 / steps) * range;
        out.push(CubicBezierCurve.fit(curve, prevStep, currentStep));
    }
    return out;
}

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

// type SpeedSegment = {
//     t0: number;
//     t1: number;
//     v0: number;
//     v1: number;
//     arcLength: number;
// };
//
// const STEP = 0.1;
//
// function buildSegments(
//     curve: Curve,
//     t0: number,
//     t1: number
// ) {
//     const segs: SpeedSegment[] = [];
//
//     let sAccum = 0;
//     let lastSegmentBreak = t0;
//     let prevT = t0;
//     const firstTangent = curve.tangentAt(t0).magnitude;
//     let prevV = firstTangent;
//
//     while (prevT < t1) {
//         let dt = STEP / prevV;
//         let currentT = prevT + dt;
//         currentT = currentT >= t1 ? t1 : currentT;
//         dt = currentT - prevT;
//         const ds = prevV * dt;
//         sAccum += ds;
//         prevT = currentT;
//         const currentV = curve.tangentAt(currentT).magnitude;
//         if (Math.abs(currentV - prevV) > 1e-1) {
//             segs.push({
//                 t0: lastSegmentBreak,
//                 t1: currentT,
//                 v0: prevV,
//                 v1: currentV,
//                 arcLength: sAccum
//             });
//             sAccum = 0;
//             lastSegmentBreak = currentT;
//         }
//         prevV = currentV;
//     }
//
//     if (segs.length === 0)
//         segs.push({
//             t0, t1,
//             v0: firstTangent, v1: prevV,
//             arcLength: sAccum
//         });
//
//     return segs;
// }
//
// export function arcLengthParametrize(
//     sourceCurve: Curve,
//     t0: number,
//     t1: number
// ) {
//     const segments = buildSegments(sourceCurve, t0, t1);
//     const s0 = 0;
//     const s1 = segments.reduce((acc, cur) => acc + cur.arcLength, 0);
//
//     function tFromS(s: number): number {
//         let t = segments[0].t0;
//         if (s === 0) return t;
//         let acc = 0;
//
//         for (const seg of segments) {
//             acc += seg.arcLength;
//             if (Math.abs(acc - s) <= 1e-2)
//                 return seg.t1;
//             if (s > acc)
//                 continue;
//             t = seg.t0 //+ (seg.t1 - seg.t0) * ((s -(acc - seg.arcLength)) / seg.arcLength);
//             s -= (acc - seg.arcLength);
//             acc = 0;
//             break;
//         }
//
//         let currentT = t;
//         let currentV = sourceCurve.tangentAt(t).magnitude;
//         let step = STEP / 2;
//
//         while (true) {
//             let dt = step / currentV;
//             const ds = currentV * dt;
//             if (Math.abs((acc + ds) - s) < 1e-2)
//                 return currentT + dt;
//             if ((acc + ds) > s) {
//                 step /= 2;
//                 continue;
//             }
//             acc += ds;
//             currentT += dt;
//             currentV = sourceCurve.tangentAt(currentT).magnitude;
//         }
//     }
//
//     const curve = new (class extends Curve {
//         at(s: number): Point2D {
//             return sourceCurve.at(tFromS(s));
//         }
//
//         tangentAt(s: number): Vector2D {
//             const p0 = this.at(s);
//             const p1 = this.at(s + STEP);
//             return Vector2D.from(p0, p1).normalize();
//         }
//     });
//
//     return [curve, s0, s1];
// }