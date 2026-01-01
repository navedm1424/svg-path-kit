import { Orientation, Vector2D } from "./vector2D";
import { Point2D } from "./point2D";
import {ifNegative} from "../utils/math";
import {Ellipse} from "./ellipse";

export class CubicBezierCurve {
    constructor(
        readonly startingPoint: Point2D,
        readonly firstControlPoint: Point2D,
        readonly secondControlPoint: Point2D,
        readonly endingPoint: Point2D
    ) { }

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
}

function midPoint(pointA: Point2D, pointB: Point2D) {
    return Point2D.of((pointA.x + pointB.x) / 2, (pointA.y + pointB.y) / 2);
}

function getScalarFactor(angle: number) {
    return (4.0 / 3.0) * Math.tan(angle / 4);
}

export function cubicBezierCurveForCircularArc(startingPoint: Point2D, angle: number, endingPoint: Point2D): CubicBezierCurve;
export function cubicBezierCurveForCircularArc(startingPoint: Point2D, radius: number, startAngle: number, endAngle: number): CubicBezierCurve;

export function cubicBezierCurveForCircularArc(...args:
    [startingPoint: Point2D, angle: number, endingPoint: Point2D] |
    [startingPoint: Point2D, radius: number, startAngle: number, endAngle: number]
) {
    if (typeof args[1] === 'number' && args[2] instanceof Point2D) {
        return cubicBezierCurveForCircularArcFromAngle(args[0], args[1], args[2]);
    } else if (
        args[0] instanceof Point2D && typeof args[1] === "number"
        && typeof args[2] === "number" && typeof args[3] === "number"
    ) {
        return cubicBezierCurveForCircularArcFromRadiusAndAngle(args[0], args[1], args[2], args[3]);
    }
}

function cubicBezierCurveForCircularArcFromAngle(startingPoint: Point2D, angle: number, endingPoint: Point2D) {
    const chordVector = Vector2D.from(startingPoint, endingPoint);
    const radius = chordVector.magnitude * Math.cos(angle / 2) / Math.sin(angle);
    const midpoint = midPoint(startingPoint, endingPoint);

    let midpointToCenter = Math.sqrt(Math.pow(radius, 2) - Math.pow(chordVector.magnitude / 2.0, 2));
    if (angle < 0)
        midpointToCenter = -midpointToCenter;

    const normalToChord = chordVector.unit().perpendicular();
    normalToChord.scale(midpointToCenter);
    const center = midpoint.add(normalToChord);

    const v0 = Vector2D.from(center, startingPoint);
    const v1 = Vector2D.from(center, endingPoint);
    const scalarFactor = getScalarFactor(angle);
    v0.scale(scalarFactor);
    v1.scale(scalarFactor);

    return new CubicBezierCurve(
        startingPoint, startingPoint.add(v0.perpendicular()),
        endingPoint.add(v1.perpendicular(Orientation.CLOCKWISE)), endingPoint
    );
}

function cubicBezierCurveForCircularArcFromRadiusAndAngle(startingPoint: Point2D, radius: number, startAngle: number, endAngle: number) {
    const centerToStart = Vector2D.polar(radius, startAngle);
    const centerToEnd = Vector2D.polar(radius, endAngle);

    const center = startingPoint.add(centerToStart.opposite());
    const endingPoint = center.add(centerToEnd);
    const scalarFactor = getScalarFactor(endAngle - startAngle);

    centerToStart.scale(scalarFactor);
    centerToEnd.scale(scalarFactor);

    return new CubicBezierCurve(
        startingPoint, startingPoint.add(centerToStart.perpendicular()),
        endingPoint.add(centerToEnd.perpendicular(Orientation.CLOCKWISE)), endingPoint
    );
}

export function cubicBezierCurveForEllipticalArc(
    startingPoint: Point2D,
    a: number, b: number,
    startAngle: number, endAngle: number,
    ellipseTilt: number = 0
): [Ellipse, CubicBezierCurve] {
    // const startParametricAngle = Math.atan2(a * Math.sin(startAngle), b * Math.cos(startAngle));
    // const endParametricAngle = ifNegative(Math.atan2(a * Math.sin(endAngle), b * Math.cos(endAngle)), angle => 2 * Math.PI + angle);

    const startAngleSine = Math.sin(startAngle);
    const startAngleCosine = Math.cos(startAngle);
    const endAngleSine = Math.sin(endAngle);
    const endAngleCosine = Math.cos(endAngle);

    const startVec = Vector2D.of(a * startAngleCosine, b * startAngleSine);
    startVec.rotate(ellipseTilt);
    const endVec = Vector2D.of(a * endAngleCosine, b * endAngleSine);
    endVec.rotate(ellipseTilt);
    const center = startingPoint.add(startVec.opposite());
    const endingPoint = center.add(endVec);

    // tangents at (a * cos(angle), b * sin(angle)) = (a * sin(angle), -b * cos(angle))
    const startControlVector = Vector2D.of(-a * startAngleSine, b * startAngleCosine);
    startControlVector.rotate(ellipseTilt);
    const endControlVector = Vector2D.of(-a * endAngleSine, b * endAngleCosine);
    endControlVector.rotate(ellipseTilt);

    // scalar factor = 4 / 3 * tan((endAngle - startAngle) / 4))
    const factor = getScalarFactor(endAngle - startAngle);
    startControlVector.scale(factor);
    endControlVector.scale(-factor);

    return [
        new Ellipse(center, a, b, ellipseTilt),
        new CubicBezierCurve(
            startingPoint, startingPoint.add(startControlVector),
            endingPoint.add(endControlVector), endingPoint
        )
    ];
}

export function cubicBezierAutoControl(
    startingPoint: Point2D,
    endingPoint: Point2D,
    startDirection?: Vector2D,  // tangent vector out of the starting point
    endDirection?: Vector2D,  // tangent vector into the ending point
    startHandleScale = 1 / 3,  // fraction of chord length for handle distance
    endHandleScale = startHandleScale
): CubicBezierCurve {
    const chord = Vector2D.from(startingPoint, endingPoint);
    const chordLen = chord.magnitude;
    if (chordLen < 1e-9)
        return new CubicBezierCurve(
            startingPoint, startingPoint, startingPoint, startingPoint
        ); // degenerate

    let p1: Point2D;
    let p2: Point2D;

    // handle start
    if (startDirection) {
        startDirection.scale(chordLen * startHandleScale);
        p1 = startingPoint.add(startDirection);
    } else {
        const chordClone = chord.clone();
        chordClone.scale(startHandleScale);
        p1 = startingPoint.add(chordClone);
    }

    // handle end
    if (endDirection) {
        endDirection.scale(chordLen * endHandleScale);
        p2 = endingPoint.add(endDirection);
    } else {
        const chordClone = chord.opposite();
        chordClone.scale(endHandleScale);
        p2 = endingPoint.add(chordClone);
    }

    return new CubicBezierCurve(
        startingPoint, p1,
        p2, endingPoint
    );
}
