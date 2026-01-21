import {PathBuilder, Point2D, Vector2D, Angle} from "../src/index";

let pb = PathBuilder.m(Point2D.ORIGIN);
pb.bezierCircularArc(5, -Math.PI, -Math.PI / 2);
const command0 = pb.bezierCircularArc(5, -Math.PI / 2, 0);
pb.bezierCircularArc(5, 0, Math.PI / 4);
pb.bezierCircularArc(5, -3 * Math.PI / 4, -Math.PI);
const command1 = pb.bezierCircularArc(1, 0, Math.PI / 2);
const lineCommand = pb.l(Point2D.of(command0.terminalPoint.x - command1.terminalPoint.x, command1.terminalPoint.y));
pb.bezierCircularArc(1, Math.PI / 2, Math.PI);
pb.bezierCircularArc(5, 0, -Math.PI / 4);
pb.bezierCircularArc(5, 3 * Math.PI / 4, Math.PI);
const bottomLineLength = lineCommand.length;
const bottomLineEndpoint = lineCommand.terminalPoint;
const bulbPath = pb.toPath();
pb = PathBuilder.m(bottomLineEndpoint.add(Vector2D.of(2 * bottomLineLength / 3, 0)));
pb.chordScaledBezier(
    Vector2D.of(1, -8),
    Angle.UP, Angle.of(5 * Math.PI / 8),
    5 / 8, 1 / 8
);
const startVelocity = pb.currentVelocity;
pb.hermiteCurve(
    startVelocity, Vector2D.polar(1.5, 3 * Math.PI / 8),
    Vector2D.of(1.25, 0)
);
pb.hermiteCurve(
    pb.currentVelocity.scale(1.5), Vector2D.polar(1.5, 7 * Math.PI / 8),
    Vector2D.of(-0.5, 1.25)
);
pb.bezierCircularArc(5, 3 * Math.PI / 8, 5 * Math.PI / 8);
pb.hermiteCurve(
    pb.currentVelocity.normalize().scale(1.5), Vector2D.polar(2, 13 * Math.PI / 8),
    Vector2D.of(-0.5, -1.25)
);
pb.hermiteCurve(
    pb.currentVelocity, Vector2D.of(startVelocity.x, -startVelocity.y),
    Vector2D.of(1.25, 0)
);
pb.chordScaledBezier(
    Vector2D.of(0.5, 8),
    pb.currentVelocity.angle, Angle.UP,
    1 / 8, 5 / 8
);
const filamentPath = pb.toPath();

console.log(bulbPath.toSVGPathString());
console.log(filamentPath.toSVGPathString());