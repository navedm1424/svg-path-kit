import {LineCommand, PathBuilder, Point2D, Vector2D} from "../src/index";

const shaftLength = 8;
const angle = Math.PI / 12;

const pb: PathBuilder = PathBuilder.m(Point2D.of(7, 0.375));
const shaftRightEdgeVector = Vector2D.polar(shaftLength, Math.PI / 2 + angle);
const shaftRightEdgeCommand: LineCommand = pb.l(shaftRightEdgeVector);

pb.l(Vector2D.polar(1, Math.PI / 2 + angle));
pb.bezierCircularArc(Math.SQRT1_2, angle, Math.PI / 2 - angle);
pb.bezierCircularArc(6, Math.PI / 2 - angle, Math.PI / 2 + angle);
pb.bezierCircularArc(Math.SQRT1_2, Math.PI / 2 + angle, Math.PI - angle);
pb.bezierCircularArc(Math.PI, Math.PI - angle, Math.PI + angle);
pb.bezierCircularArc(0.75, Math.PI, 3 * Math.PI / 2, angle);
pb.bezierCircularArc(12, -Math.PI / 2 + angle, -Math.PI / 2 + 2 * angle);

pb.cAutoControl(
    shaftRightEdgeCommand.terminalPoint.add(Vector2D.polar(0.5, angle + Math.PI)),
    2 * angle, Math.PI / 2 + angle,
    1 / 3, 2 / 3
);
pb.l(shaftRightEdgeVector.opposite());
pb.bezierCircularArc(0.25, Math.PI, 3 * Math.PI / 2, angle);
pb.bezierCircularArc(0.25, 3 * Math.PI / 2, 2 * Math.PI, angle);
pb.z();

console.log(pb.toString());