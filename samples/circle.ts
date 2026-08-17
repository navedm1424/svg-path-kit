import {PathBuilder, Point2D} from "../src/index.js";
import {fitSplineTo} from "../src/spline-fitting.js";
import {Circle} from "../src/curves/index.js";

const circle = Circle.of(2);

const pb = PathBuilder.m(Point2D.ORIGIN);

fitSplineTo(pb, circle, 0, 2 * Math.PI);
// pb.m(Point2D.ORIGIN);
// pb.bezierCircularArc(2, 0, Math.PI / 2);

console.log(pb.toSVGPathString());