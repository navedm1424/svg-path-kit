import { Point2D, RotationDirection, Vector2D } from "./svg";

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
};

function midPoint(pointA: Point2D, pointB: Point2D) {
    return Point2D.of((pointA.x + pointB.x) / 2, (pointA.y + pointB.y) / 2);
};

function getScalarFactor(angle: number) {
    return (4.0 / 3.0) * Math.tan(angle / 4);
};

export function cubicBezierCurveForCircularArc(startingPoint: Point2D, angle: number, endingPoint: Point2D): CubicBezierCurve;
export function cubicBezierCurveForCircularArc(center: Point2D, startingPoint: Point2D, angle: number): CubicBezierCurve;

export function cubicBezierCurveForCircularArc(...args:
    [startingPoint: Point2D, angle: number, endingPoint: Point2D] |
    [center: Point2D, startingPoint: Point2D, angle: number]
) {
    if (typeof args[1] === 'number' && args[2] instanceof Point2D) {
        return cubicBezierCurveForCircularArcFromAngle(args[0], args[1], args[2]);
    } else if (args[1] instanceof Point2D && typeof args[2] === "number") {
        return cubicBezierCurveForCircularArcFromCenterAndAngle(args[0], args[1], args[2]);
    }
};

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
        endingPoint.add(v1.perpendicular(RotationDirection.CLOCKWISE)), endingPoint
    );
};

function cubicBezierCurveForCircularArcFromCenterAndAngle(center: Point2D, startingPoint: Point2D, angle: number) {
    const v0 = Vector2D.from(center, startingPoint);
    const v1 = v0.clone();
    v1.rotate(angle);
    const endingPoint = center.add(v1);
    const scalarFactor = getScalarFactor(angle);
    v0.scale(scalarFactor);
    v1.scale(scalarFactor);

    return new CubicBezierCurve(
        startingPoint, startingPoint.add(v0.perpendicular()),
        endingPoint.add(v1.perpendicular(RotationDirection.CLOCKWISE)), endingPoint
    );
};

export function cubicBezierCurveForEllipticalArc(
    center: Point2D, startingPoint: Point2D, centralAngle: number, ratio: number, phi: number
) {
    const startVec = Vector2D.from(center, startingPoint);
    startVec.rotate(-phi);

    const endDirection = startVec.clone();
    endDirection.rotate(centralAngle);

    // (x/a)^2 + (y/b)^2 = 1
    // → (x/(ratio*b))^2 + (y/b)^2 = 1
    // → b = √((x/ratio)^2 + y^2)
    const b = Math.hypot(startVec.x / ratio, startVec.y);
    const a = ratio * b;

    const startParametricAngle = Math.atan2(startVec.y / b, startVec.x / a);
    const endParametricAngle = Math.atan2(endDirection.y / b, endDirection.x / a);

    const endVec = Vector2D.of(a * Math.cos(endParametricAngle), b * Math.sin(endParametricAngle));
    endVec.rotate(phi);
    const endingPoint = center.add(endVec);

    // local derivatives
    const startDerivative = Vector2D.of(-a * Math.sin(startParametricAngle),  b * Math.cos(startParametricAngle));
    const endDerivative = Vector2D.of(-a * Math.sin(endParametricAngle),  b * Math.cos(endParametricAngle));

    const parametricAngleDiff = endParametricAngle - startParametricAngle;
    startDerivative.scale(parametricAngleDiff / 3.0);
    endDerivative.scale(parametricAngleDiff / 3.0);

    startDerivative.rotate(phi);
    endDerivative.rotate(phi);

    return new CubicBezierCurve(
        startingPoint, startingPoint.add(startDerivative),
        endingPoint.add(endDerivative.opposite()), endingPoint
    );
}

export function cubicBezierAutoControl(
    startingPoint: Point2D,
    endingPoint: Point2D,
    startDirection?: Vector2D,  // tangent vector out of the starting point
    endDirection?: Vector2D,  // tangent vector into the ending point
    tensionA = 1 / 3,  // fraction of chord length for handle distance
    tensionB = tensionA
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
        startDirection.scale(chordLen * tensionA);
        p1 = startingPoint.add(startDirection);
    } else {
        const chordClone = chord.clone();
        chordClone.scale(tensionA);
        p1 = startingPoint.add(chordClone);
    }

    // handle end
    if (endDirection) {
        endDirection.scale(chordLen * tensionB);
        p2 = endingPoint.add(endDirection);
    } else {
        const chordClone = chord.opposite();
        chordClone.scale(tensionB);
        p2 = endingPoint.add(chordClone);
    }

    return new CubicBezierCurve(
        startingPoint, p1,
        p2, endingPoint
    );
};
