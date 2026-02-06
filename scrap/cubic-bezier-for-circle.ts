import {CubicBezierCurve, Point2D, Vector2D} from "../src/index";

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
