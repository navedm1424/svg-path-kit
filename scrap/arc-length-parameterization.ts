import {ParametricCurve2D, Point2D, Vector2D} from "../src/index.js";

type SpeedSegment = {
    t0: number;
    t1: number;
    v0: number;
    v1: number;
    arcLength: number;
};

const STEP = 0.1;

function buildSegments(
    curve: ParametricCurve2D,
    t0: number,
    t1: number
) {
    const segs: SpeedSegment[] = [];

    let sAccum = 0;
    let lastSegmentBreak = t0;
    let prevT = t0;
    const firstTangent = curve.tangentAt(t0).magnitude;
    let prevV = firstTangent;

    while (prevT < t1) {
        let dt = STEP / prevV;
        let currentT = prevT + dt;
        currentT = currentT >= t1 ? t1 : currentT;
        dt = currentT - prevT;
        const ds = prevV * dt;
        sAccum += ds;
        prevT = currentT;
        const currentV = curve.tangentAt(currentT).magnitude;
        if (Math.abs(currentV - prevV) > 1e-1) {
            segs.push({
                t0: lastSegmentBreak,
                t1: currentT,
                v0: prevV,
                v1: currentV,
                arcLength: sAccum
            });
            sAccum = 0;
            lastSegmentBreak = currentT;
        }
        prevV = currentV;
    }

    if (segs.length === 0)
        segs.push({
            t0, t1,
            v0: firstTangent, v1: prevV,
            arcLength: sAccum
        });

    return segs;
}

export function arcLengthParametrize(
    sourceCurve: ParametricCurve2D,
    t0: number,
    t1: number
) {
    const segments = buildSegments(sourceCurve, t0, t1);
    const s0 = 0;
    const s1 = segments.reduce((acc, cur) => acc + cur.arcLength, 0);

    function tFromS(s: number): number {
        let t = segments[0]!.t0;
        if (s === 0) return t;
        let acc = 0;

        for (const seg of segments) {
            acc += seg.arcLength;
            if (Math.abs(acc - s) <= 1e-2)
                return seg.t1;
            if (s > acc)
                continue;
            t = seg.t0 //+ (seg.t1 - seg.t0) * ((s -(acc - seg.arcLength)) / seg.arcLength);
            s -= (acc - seg.arcLength);
            acc = 0;
            break;
        }

        let currentT = t;
        let currentV = sourceCurve.tangentAt(t).magnitude;
        let step = STEP / 2;

        while (true) {
            let dt = step / currentV;
            const ds = currentV * dt;
            if (Math.abs((acc + ds) - s) < 1e-2)
                return currentT + dt;
            if ((acc + ds) > s) {
                step /= 2;
                continue;
            }
            acc += ds;
            currentT += dt;
            currentV = sourceCurve.tangentAt(currentT).magnitude;
        }
    }

    const curve = new (class extends ParametricCurve2D {
        at(s: number): Point2D {
            return sourceCurve.at(tFromS(s));
        }

        tangentAt(s: number): Vector2D {
            const p0 = this.at(s);
            const p1 = this.at(s + STEP);
            return Vector2D.from(p0, p1).normalize();
        }
    });

    return [curve, s0, s1];
}