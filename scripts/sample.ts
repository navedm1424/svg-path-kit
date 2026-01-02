import {PathBuilder, Point2D} from "../src/index";
import {EllipticalArc} from "../src/ellipse";

// const ellipticalArc = new EllipticalArc(
//     5, 3,
//     5 * Math.PI / 6, 4 * Math.PI / 3,
//     -Math.PI
// );
// const endingTangentVector = ellipticalArc.endingTangentVector;
// const pb = PathBuilder.m(Point2D.of(4, 0));
// pb.l(ellipticalArc.startingTangentVector);
// pb.ellipticalArc(ellipticalArc);
// pb.l(endingTangentVector);
//
// let angle = endingTangentVector.angle - Math.PI / 2;
// pb.circularArc(2, 0, Math.PI / 2, angle);
// let lastCommand = pb.ellipticalArc(4, 2, 0, Math.PI / 2, angle + Math.PI / 2);
//
// const endVelocity = lastCommand.getEndVelocity();
// angle = endVelocity.angle - Math.PI / 2;
// pb.circularArc(2, 0, Math.PI / 2, angle);
// pb.circularArc(3, Math.PI / 2, Math.PI, angle);
// pb.circularArc(5, Math.PI, 3 * Math.PI / 2, angle);
// pb.circularArc(8, 3 * Math.PI / 2, 2 * Math.PI, angle);
// pb.circularArc(13, Math.PI, Math.PI / 2, angle);
// pb.circularArc(21, -Math.PI / 2, 0, angle);
// pb.circularArc(13, 0, Math.PI / 2, angle);
// pb.circularArc(8, Math.PI / 2, Math.PI, angle);
// pb.circularArc(5, 0, -Math.PI / 2, angle);
// pb.circularArc(3, Math.PI / 2, Math.PI, angle);
// pb.circularArc(2, Math.PI, 3 * Math.PI / 2, angle);
// pb.circularArc(2, 3 * Math.PI / 2, 2 * Math.PI, angle);
// pb.circularArc(1.75, 0, Math.PI / 2, angle);
// pb.circularArc(1.75, Math.PI / 2, Math.PI, angle);
// pb.circularArc(1.5, Math.PI, 3 * Math.PI / 2, angle);
// pb.circularArc(8, Math.PI / 2, 0, angle);
// pb.circularArc(5, 0, -Math.PI / 2, angle);
// lastCommand = pb.circularArc(13, Math.PI / 2, Math.PI, angle);
//
// pb.hermiteCurve(
//     lastCommand.getEndVelocity(), ellipticalArc.startingTangentVector,
//     pb.pathStart
// );
// pb.z();

const pb = PathBuilder.m(Point2D.ORIGIN);
const limit = 13;
const jLimit = 7;
for (let j = jLimit - 1; j >= 0; j--) {
    let a = 0;
    let b = 1;
    let angle = Math.PI;
    const innerLimit = limit - j;
    for (let i = 0; i < innerLimit; i++) {
        let temp = a;
        a = b;
        b = temp + b;
        pb.circularArc(b, angle, angle += Math.PI / 2);
    }

    angle -= Math.PI;
    let temp = a;
    a = b;
    b = temp;

    for (let i = 0; i < innerLimit; i++) {
        pb.circularArc(a, angle, angle -= Math.PI / 2);
        let temp = a;
        a = b;
        b = temp - b;
    }
}

pb.m(Point2D.ORIGIN);

for (let j = jLimit - 1; j >= 0; j--) {
    let a = 0;
    let b = 1;
    let angle = 0;
    const innerLimit = limit - j;
    for (let i = 0; i < innerLimit; i++) {
        let temp = a;
        a = b;
        b = temp + b;
        pb.circularArc(b, angle, angle += Math.PI / 2);
    }

    angle -= Math.PI;
    let temp = a;
    a = b;
    b = temp;

    for (let i = 0; i < innerLimit; i++) {
        pb.circularArc(a, angle, angle -= Math.PI / 2);
        let temp = a;
        a = b;
        b = temp - b;
    }
}

console.log(pb.toString());

