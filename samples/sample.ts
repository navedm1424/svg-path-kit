import {PathBuilder, Point2D} from "../src/index";
import {EllipticalArc} from "../src/curves/index";

const ellipticalArc = new EllipticalArc(
    5, 3,
    5 * Math.PI / 6, 4 * Math.PI / 3,
    -Math.PI
);
const endingTangentVector = ellipticalArc.endingTangentVector;
const pb = PathBuilder.m(Point2D.of(4, 0));
pb.l(ellipticalArc.startingTangentVector);
pb.bezierEllipticalArc(ellipticalArc);
pb.l(endingTangentVector);

let angle = endingTangentVector.angle - Math.PI / 2;
pb.bezierCircularArc(2, 0, Math.PI / 2, angle);
let lastCommand = pb.bezierEllipticalArc(4, 2, 0, Math.PI / 2, angle + Math.PI / 2);

const endVelocity = lastCommand.getEndVelocity();
angle = endVelocity.angle - Math.PI / 2;
pb.bezierCircularArc(2, 0, Math.PI / 2, angle);
pb.bezierCircularArc(3, Math.PI / 2, Math.PI, angle);
pb.bezierCircularArc(5, Math.PI, 3 * Math.PI / 2, angle);
pb.bezierCircularArc(8, 3 * Math.PI / 2, 2 * Math.PI, angle);
pb.bezierCircularArc(13, Math.PI, Math.PI / 2, angle);
pb.bezierCircularArc(21, -Math.PI / 2, 0, angle);
pb.bezierCircularArc(13, 0, Math.PI / 2, angle);
pb.bezierCircularArc(8, Math.PI / 2, Math.PI, angle);
pb.bezierCircularArc(5, 0, -Math.PI / 2, angle);
pb.bezierCircularArc(3, Math.PI / 2, Math.PI, angle);
pb.bezierCircularArc(2, Math.PI, 3 * Math.PI / 2, angle);
pb.bezierCircularArc(2, 3 * Math.PI / 2, 2 * Math.PI, angle);
pb.bezierCircularArc(1.75, 0, Math.PI / 2, angle);
pb.bezierCircularArc(1.75, Math.PI / 2, Math.PI, angle);
pb.bezierCircularArc(1.5, Math.PI, 3 * Math.PI / 2, angle);
pb.bezierCircularArc(8, Math.PI / 2, 0, angle);
pb.bezierCircularArc(5, 0, -Math.PI / 2, angle);
lastCommand = pb.bezierCircularArc(13, Math.PI / 2, Math.PI, angle);

pb.hermiteCurve(
    lastCommand.getEndVelocity(), ellipticalArc.startingTangentVector,
    pb.pathStart
);
pb.z();

console.log(pb.toString());