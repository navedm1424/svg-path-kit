import {PathBuilder, Point2D} from "../src/index";
import {fitSplineAtParams} from "../src/spline-fitting";
import {Superellipse} from "../src/curves/superellipse";

const superellipse = new Superellipse(5, 5, 2);

const pb = PathBuilder.m(Point2D.ORIGIN);

const ts = [0, Math.PI / 28, Math.PI / 4, 13 * Math.PI / 28];
const length = ts.length;
for (let i = 1; i < 4; i++) {
    for (let j = 0; j < length; j++) {
        const sourceIndex = j + (i - 1) * length;
        ts[sourceIndex + length] = ts[sourceIndex] + Math.PI / 2;
    }
}
ts.push(2 * Math.PI);
fitSplineAtParams(pb, superellipse, ...ts);

console.log(pb.toString());