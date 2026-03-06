import {Angle, PathBuilder, Point2D, Vector2D} from "../dist/index.js";

const pb = PathBuilder.m(Point2D.ORIGIN);
const RADIUS = 2.34;
const a = Angle.of(Math.PI / 32);
const b = Angle.of(7 * Math.PI / 36);
const PI_PLUS_A = Angle.PI.add(a);
const TWO_PI_MINUS_A = Angle.TWO_PI.subtract(a);
const PI_MINUS_B = Angle.PI.subtract(b);

for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 6) {
    pb.circularArc(RADIUS, PI_PLUS_A, TWO_PI_MINUS_A, angle);
    pb.circularArc(RADIUS, PI_MINUS_B, b, angle += Math.PI / 6);
}

const innerCircleRadius = 3.34;

const circleStart = pb.pathStart
    .add(Vector2D.of(RADIUS * a.cosine + innerCircleRadius, 0))
    .add(Vector2D.of(0, 2 * RADIUS * b.cosine * Math.sin(Math.PI / 6)))
    .add(Vector2D.of(0, 2 * RADIUS * a.cosine * Math.sin(Math.PI / 3)))
    .add(Vector2D.of(0, RADIUS * b.cosine));

pb.m(circleStart);
pb.circularArc(innerCircleRadius, Angle.ZERO, Angle.PI.negated());
pb.circularArc(innerCircleRadius, Angle.PI.negated(), Angle.TWO_PI.negated());

console.log(pb.toSVGPathString());