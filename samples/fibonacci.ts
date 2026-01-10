import {PathBuilder, Point2D} from "../src/index";

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
        pb.bezierCircularArc(b, angle, angle += Math.PI / 2);
    }

    angle -= Math.PI;
    let temp = a;
    a = b;
    b = temp;

    for (let i = 0; i < innerLimit; i++) {
        pb.bezierCircularArc(a, angle, angle -= Math.PI / 2);
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
        pb.bezierCircularArc(b, angle, angle += Math.PI / 2);
    }

    angle -= Math.PI;
    let temp = a;
    a = b;
    b = temp;

    for (let i = 0; i < innerLimit; i++) {
        pb.bezierCircularArc(a, angle, angle -= Math.PI / 2);
        let temp = a;
        a = b;
        b = temp - b;
    }
}

console.log(pb.toString());