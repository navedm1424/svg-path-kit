import {Angle, PathBuilder, Point2D, Vector2D} from "../dist/index.js";

const pb = PathBuilder.m(Point2D.ORIGIN);
const SHAFT_LENGTH = 7.5;
const rotation = Angle.QUARTER_PI.negated();
const PI_BY_8 = Angle.QUARTER_PI.multiply(1/2);
const PI_BY_16 = Angle.of(Math.PI / 16);
const SHAFT_TILT = PI_BY_16.multiply(1/8);
const JAW_ARC_START_ANGLE = Angle.QUARTER_PI.multiply(5 / 4);
const JAW_ARC_RADIUS = 1.75;

pb.l(Vector2D.polar(SHAFT_LENGTH, rotation.add(SHAFT_TILT)));

pb.bezierCircularArc(2.5, SHAFT_TILT.halfTurnForward(), JAW_ARC_START_ANGLE, rotation);
pb.bezierCircularArc(JAW_ARC_RADIUS, JAW_ARC_START_ANGLE.flipForward(), Angle.TWO_PI.subtract(Angle.QUARTER_PI), rotation);
pb.bezierCircularArc(0.08, Angle.QUARTER_PI.negated(), Angle.HALF_PI, rotation);

pb.l(Vector2D.polar(1.25, rotation).opposite());
let last = pb.bezierCircularArc(0.25, Angle.HALF_PI.multiply(3), PI_BY_8.multiply(3 / 4).flipForward(), rotation);
last = pb.bezierCircularArc(1.5, last.arc.endAngle, PI_BY_8.multiply(3 / 4).supplement(), rotation);
pb.bezierCircularArc(0.25, last.arc.endAngle, Angle.HALF_PI, rotation);
pb.l(Vector2D.polar(1.25, rotation));

pb.bezierCircularArc(0.08, Angle.HALF_PI.negated(), Angle.QUARTER_PI, rotation);
pb.bezierCircularArc(JAW_ARC_RADIUS, Angle.QUARTER_PI, JAW_ARC_START_ANGLE.supplement(), rotation);
pb.bezierCircularArc(2.5, JAW_ARC_START_ANGLE.negated(), SHAFT_TILT.halfTurnForward().negated(), rotation);
pb.l(Vector2D.polar(SHAFT_LENGTH, rotation.subtract(SHAFT_TILT)).opposite());

const endcapDiameter = pb.currentPosition.toVector().magnitude;
pb.circularArc(endcapDiameter / 2, SHAFT_TILT.complement(), Angle.HALF_PI.multiply(3).add(SHAFT_TILT), rotation);
pb.z();
const innerCircleRadius = endcapDiameter * 11 / 32;
pb.m(Vector2D.polar(endcapDiameter / 2 + innerCircleRadius, rotation.halfTurnForward()));
pb.circularArc(innerCircleRadius, Angle.HALF_PI, Angle.HALF_PI.negated(), rotation);
pb.circularArc(innerCircleRadius, Angle.HALF_PI.negated(), Angle.of(-Math.PI * 3 / 2), rotation);
pb.z();

console.log(pb.toSVGPathString());