import {CubicBezierCurve, Point2D, Vector2D} from "../src/index.js";

function lerpBetweenPoints(a: Point2D, b: Point2D, t: number) {
    return Point2D.of(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
}

/** Split the curve at parameter `t` */
function splitBezierAt(bez: CubicBezierCurve, t: number): [CubicBezierCurve, CubicBezierCurve] {
    const q0 = lerpBetweenPoints(bez.startingPoint, bez.firstControlPoint, t);
    const q1 = lerpBetweenPoints(bez.firstControlPoint, bez.secondControlPoint, t);
    const q2 = lerpBetweenPoints(bez.secondControlPoint, bez.endingPoint, t);

    const r0 = lerpBetweenPoints(q0, q1, t);
    const r1 = lerpBetweenPoints(q1, q2, t);

    const s = lerpBetweenPoints(r0, r1, t);
    const rel = (p: Point2D): Point2D => Point2D.of(p.x - s.x, p.y - s.y);

    return [
        new CubicBezierCurve(bez.startingPoint, q0, r0, s),
        new CubicBezierCurve(Point2D.ORIGIN, rel(r1), rel(q2), rel(bez.endingPoint))
    ];
}

function cubicBezierCurveForCircularArcFromAngle(startingPoint: Point2D, angle: number, endingPoint: Point2D) {
    const chordVector = Vector2D.from(startingPoint, endingPoint);
    const radius = chordVector.magnitude * Math.cos(angle / 2) / Math.sin(angle);
    const midpoint = lerpBetweenPoints(startingPoint, endingPoint, 0.5);

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
