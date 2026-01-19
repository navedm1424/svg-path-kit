import {PathBuilder} from "./path-builder";
import {Point2D} from "./point2D";
import {Vector2D} from "./vector2D";
import {ParametricCurve2D} from "./parametric-curve-2D";
import {clamp, round} from "./utils/index";
import {CubicBezierCurve} from "./cubic-bezier-curve";

const roundingOrder = 8;
const equalityThreshold = Math.pow(10, -roundingOrder);

function findRoots(f: (t: number) => number, tStart: number, tEnd: number) {
    if (!Number.isFinite(tStart) || !Number.isFinite(tEnd))
        throw Error("invalid arguments.");

    const roots: number[] = [];

    let tCurr = tStart, vCurr = f(tCurr);
    if (Math.abs(vCurr) < equalityThreshold)
        roots.push(tCurr);
    const eps = 1e-4;
    let currSpeed = (f(tCurr + eps) - f(tCurr - eps)) / (2 * eps);

    while (Math.abs(tEnd - tCurr) >= equalityThreshold) {
        const dt = clamp(0.1 / Math.abs(currSpeed), eps, 0.1);
        let tNext = tCurr + dt;
        if (tNext > tEnd)
            tNext = tEnd;
        const vNext = f(tNext);
        const nextSpeed = (f(tNext + eps) - f(tNext - eps)) / (2 * eps);
        if (Math.abs(vNext - vCurr) >= equalityThreshold && Math.abs(vNext) < equalityThreshold) {
            roots.push(tNext);
        } else if (vCurr * vNext < 0 || (currSpeed * nextSpeed < 0 && (Math.abs(vCurr) <= 0.1 || Math.abs(vNext) <= 0.1))) {
            // bisection
            let a = tCurr, b = tNext;
            let fa = vCurr, fb = vNext;
            let root = (a + b) / 2;
            for (let j = 0; j < 50; j++) {
                root = (a + b) / 2;
                const fr = f(root);
                if (Math.abs(fr) < equalityThreshold) break;
                if (fa * fr <= 0) { b = root; fb = fr; }
                else { a = root; fa = fr; }
            }
            roots.push(root);
        }

        tCurr = tNext; vCurr = vNext; currSpeed = nextSpeed;
    }
    return roots;
}

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

export class CubicBezierFit {
    readonly cubicBezierCurve: CubicBezierCurve;

    constructor(
        readonly targetParametricCurve: ParametricCurve2D,
        readonly segmentStart: number,
        readonly segmentEnd: number
    ) {
        this.cubicBezierCurve = CubicBezierFit.fit(targetParametricCurve, segmentStart, segmentEnd);
    }

    private static fit(
        curve: ParametricCurve2D,
        t0: number, t1: number
    ) {
        const p0 = curve.at(t0);
        const p3 = curve.at(t1);
        const p0Vec = p0.toVector();
        const p3Vec = p3.toVector();
        const midPoint = curve.at((t0 + t1) / 2).toVector();

        const v0 = curve.tangentAt(t0);
        const v1 = curve.tangentAt(t1);
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

export function fitSplineBySubdivision(
    pb: PathBuilder,
    curve: ParametricCurve2D,
    t0: number, t1: number,
    tolerance: number = 0.25
) {
    const bezierFit = new CubicBezierFit(curve, t0, t1);

    if (bezierFit.radialError() < tolerance) {
        const bezier = bezierFit.cubicBezierCurve;
        pb.c(
            Vector2D.from(bezier.startingPoint, bezier.firstControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.secondControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.endingPoint)
        );
        return;
    }

    const tm = (t0 + t1) / 2;
    fitSplineBySubdivision(
        pb, curve, t0, tm, tolerance
    );
    fitSplineBySubdivision(
        pb, curve, tm, t1, tolerance
    );
}

export function fitSplineInSteps(
    pb: PathBuilder,
    curve: ParametricCurve2D,
    t0: number, t1: number,
    steps: number
) {
    const range = t1 - t0;
    let prevStep = t0;
    let currentStep = prevStep;
    while (Math.abs(t1 - currentStep) > 1e-4) {
        prevStep = currentStep;
        currentStep = currentStep + (1 / steps) * range;
        const bezier = new CubicBezierFit(curve, prevStep, currentStep).cubicBezierCurve;
        pb.c(
            Vector2D.from(bezier.startingPoint, bezier.firstControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.secondControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.endingPoint)
        );
    }
}

export function fitSplineAtParams(pb: PathBuilder, curve: ParametricCurve2D, ...ts: number[]) {
    for (let i = 1; i < ts.length; i++) {
        const bezier = new CubicBezierFit(curve, ts[i - 1], ts[i])
            .cubicBezierCurve;
        pb.c(
            Vector2D.from(bezier.startingPoint, bezier.firstControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.secondControlPoint),
            Vector2D.from(bezier.startingPoint, bezier.endingPoint)
        );
    }
}

export function fitSplineTo(pb: PathBuilder, curve: ParametricCurve2D, t0: number, t1: number) {
    fitSplineAtParams(pb, curve, ...findCriticalTs(curve, t0, t1));
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