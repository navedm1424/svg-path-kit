import {Vector2D} from "./vector2D";
import {Point2D} from "./point2D";
import {Curve} from "./curve";

export class CubicBezierCurve {
    constructor(
        readonly startingPoint: Point2D,
        readonly firstControlPoint: Point2D,
        readonly secondControlPoint: Point2D,
        readonly endingPoint: Point2D
    ) { }


    public static fit(
        curve: Curve,
        t0: number, t1: number
    ): CubicBezierCurve {
        const p0 = curve.at(t0);
        const p1 = curve.at(t1);
        const scale = (t1 - t0) / 3;
        const d0 = curve.tangentAt(t0).scale(scale);
        const d1 = curve.tangentAt(t1).scale(-scale);
        return new CubicBezierCurve(
            p0, p0.add(d0), p1.add(d1), p1
        );
    }

    // public static fit(
    //     curve: Curve,
    //     t0: number,
    //     t1: number,
    //     samples = 8
    // ): CubicBezierCurve {
    //
    //     const P0 = curve.at(t0);
    //     const P3 = curve.at(t1);
    //
    //     // Accumulate least-squares system:
    //     // [ a b ] [P1] = [ e ]
    //     // [ b c ] [P2]   [ f ]
    //
    //     let a = 0, b = 0, c = 0;
    //     let ex = 0, ey = 0;
    //     let fx = 0, fy = 0;
    //
    //     for (let i = 1; i <= samples; i++) {
    //         const u = i / (samples + 1);
    //         const t = t0 + u * (t1 - t0);
    //
    //         const Q = curve.at(t);
    //
    //         const b0 = Math.pow(1 - u, 3);
    //         const b1 = 3 * u * Math.pow(1 - u, 2);
    //         const b2 = 3 * u * u * (1 - u);
    //         const b3 = Math.pow(u, 3);
    //
    //         const rx = Q.x - (b0 * P0.x + b3 * P3.x);
    //         const ry = Q.y - (b0 * P0.y + b3 * P3.y);
    //
    //         a += b1 * b1;
    //         b += b1 * b2;
    //         c += b2 * b2;
    //
    //         ex += b1 * rx;
    //         ey += b1 * ry;
    //
    //         fx += b2 * rx;
    //         fy += b2 * ry;
    //     }
    //
    //     const det = a * c - b * b;
    //
    //     // Fallback if degenerate (straight line, tiny segment)
    //     if (Math.abs(det) < 1e-12) {
    //         const scale = (t1 - t0) / 3;
    //         const d0 = curve.tangentAt(t0).scale(scale);
    //         const d1 = curve.tangentAt(t1).scale(-scale);
    //         return new CubicBezierCurve(
    //             P0, P0.add(d0), P3.add(d1), P3
    //         );
    //     }
    //
    //     const invDet = 1 / det;
    //
    //     const P1 = Point2D.of(
    //         ( c * ex - b * fx) * invDet,
    //         ( c * ey - b * fy) * invDet
    //     );
    //
    //     const P2 = Point2D.of(
    //         (-b * ex + a * fx) * invDet,
    //         (-b * ey + a * fy) * invDet
    //     );
    //
    //     return new CubicBezierCurve(P0, P1, P2, P3);
    // }


    public getPointAt(t: number): Point2D {
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

    public getTangentAt(t: number): Vector2D {
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

    public maxError(curve: Curve, t0: number, t1: number): number {
        let max = 0;
        for (let i = 1; i < 10; i++) {
            const u = i / 10;
            const t = t0 + u * (t1 - t0);
            const p = curve.at(t);
            const q = this.getPointAt(u);
            max = Math.max(max, Math.hypot(p.x - q.x, p.y - q.y));
        }
        return max;
    }
}

function midPoint(pointA: Point2D, pointB: Point2D) {
    return Point2D.of((pointA.x + pointB.x) / 2, (pointA.y + pointB.y) / 2);
}

function cubicBezierCurveForCircularArcFromAngle(startingPoint: Point2D, angle: number, endingPoint: Point2D) {
    const chordVector = Vector2D.from(startingPoint, endingPoint);
    const radius = chordVector.magnitude * Math.cos(angle / 2) / Math.sin(angle);
    const midpoint = midPoint(startingPoint, endingPoint);

    let midpointToCenter = Math.sqrt(Math.pow(radius, 2) - Math.pow(chordVector.magnitude / 2.0, 2));
    if (angle < 0)
        midpointToCenter = -midpointToCenter;

    const normalToChord = chordVector.normalize().perpendicular();
    normalToChord.scale(midpointToCenter);
    const center = midpoint.add(normalToChord);

    const v0 = Vector2D.from(center, startingPoint);
    const v1 = Vector2D.from(center, endingPoint);
    const scalarFactor = (4.0 / 3.0) * Math.tan(angle / 4);
    v0.scale(scalarFactor);
    v1.scale(scalarFactor);

    return new CubicBezierCurve(
        startingPoint, startingPoint.add(v0.perpendicular()),
        endingPoint.add(v1.perpendicular(-1)), endingPoint
    );
}
