import {Vector2D} from "./vector2D";
import {Point2D} from "./point2D";
import {ParametricCurve2D} from "./parametric-curve-2D";

export class CubicBezierCurve extends ParametricCurve2D {
    constructor(
        readonly startingPoint: Point2D,
        readonly firstControlPoint: Point2D,
        readonly secondControlPoint: Point2D,
        readonly endingPoint: Point2D
    ) {
        super();
    }

    public at(t: number): Point2D {
        const u = 1 - t;
    
        const p0 = this.startingPoint;
        const p1 = this.firstControlPoint;
        const p2 = this.secondControlPoint;
        const p3 = this.endingPoint;
    
        const x =
            u*u*u * p0.x +
            3*u*u*t * p1.x +
            3*u*t*t * p2.x +
            t*t*t * p3.x;
    
        const y =
            u*u*u * p0.y +
            3*u*u*t * p1.y +
            3*u*t*t * p2.y +
            t*t*t * p3.y;
    
        return Point2D.of(x, y);
    }

    public tangentAt(t: number): Vector2D {
        const u = 1 - t;
    
        const p0 = this.startingPoint;
        const p1 = this.firstControlPoint;
        const p2 = this.secondControlPoint;
        const p3 = this.endingPoint;
    
        const dx =
            3*u*u * (p1.x - p0.x) +
            6*u*t * (p2.x - p1.x) +
            3*t*t * (p3.x - p2.x);
    
        const dy =
            3*u*u * (p1.y - p0.y) +
            6*u*t * (p2.y - p1.y) +
            3*t*t * (p3.y - p2.y);
    
        return Vector2D.of(dx, dy);
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

    private lerp(a: Point2D, b: Point2D, t: number) {
        return Point2D.of(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    }    

    public splitAt(
        t: number,
        side: 'left' | 'right' = 'left'
    ) {
        const q0 = this.lerp(this.startingPoint, this.firstControlPoint, t);
        const q1 = this.lerp(this.firstControlPoint, this.secondControlPoint, t);
        const q2 = this.lerp(this.secondControlPoint, this.endingPoint, t);
    
        const r0 = this.lerp(q0, q1, t);
        const r1 = this.lerp(q1, q2, t);
    
        const s = this.lerp(r0, r1, t);
    
        if (side === 'left')
            return new CubicBezierCurve(this.startingPoint, q0, r0, s);
    
        const rel = (p: Point2D): Point2D => Point2D.of(p.x - s.x, p.y - s.y);
      
        return new CubicBezierCurve(Point2D.of(0, 0), rel(r1), rel(q2), rel(this.endingPoint));
    }
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
        if (Math.abs(denominator) < 1e-8) {
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

// function midPoint(pointA: Point2D, pointB: Point2D) {
//     return Point2D.of((pointA.x + pointB.x) / 2, (pointA.y + pointB.y) / 2);
// }
//
// function cubicBezierCurveForCircularArcFromAngle(startingPoint: Point2D, angle: number, endingPoint: Point2D) {
//     const chordVector = Vector2D.from(startingPoint, endingPoint);
//     const radius = chordVector.magnitude * Math.cos(angle / 2) / Math.sin(angle);
//     const midpoint = midPoint(startingPoint, endingPoint);
//
//     let midpointToCenter = Math.sqrt(Math.pow(radius, 2) - Math.pow(chordVector.magnitude / 2.0, 2));
//     if (angle < 0)
//         midpointToCenter = -midpointToCenter;
//
//     const normalToChord = chordVector.normalize().perpendicular();
//     normalToChord.scale(midpointToCenter);
//     const center = midpoint.add(normalToChord);
//
//     const v0 = Vector2D.from(center, startingPoint);
//     const v1 = Vector2D.from(center, endingPoint);
//     const scalarFactor = (4.0 / 3.0) * Math.tan(angle / 4);
//     v0.scale(scalarFactor);
//     v1.scale(scalarFactor);
//
//     return new CubicBezierCurve(
//         startingPoint, startingPoint.add(v0.perpendicular()),
//         endingPoint.add(v1.perpendicular(-1)), endingPoint
//     );
// }
