import {CubicBezierCurve, PathBuilder, Point2D, Vector2D} from "../src/index";
import {Curve} from "../src/curve";
import {fitCurve} from "../src/spline-functions";

const circle = new (class extends Curve {
    constructor(readonly radius: number) {
        super();
    }

    at(t: number): Point2D {
        return Point2D.of(this.radius * Math.cos(t), this.radius * Math.sin(t));
    }
    tangentAt(t: number): Vector2D {
        return Vector2D.of(-this.radius * Math.sin(t), this.radius * Math.cos(t));
    }
})(2);

const pb = PathBuilder.m(Point2D.ORIGIN);

const spline: CubicBezierCurve[] = fitCurve(circle, 0, Math.PI / 2, 0.25);
console.log(spline.length);
spline.forEach(c => pb.c(
    Vector2D.from(c.startingPoint, c.firstControlPoint),
    Vector2D.from(c.startingPoint, c.secondControlPoint),
    Vector2D.from(c.startingPoint, c.endingPoint)
));
pb.m(Point2D.ORIGIN);
pb.bezierCircularArc(2, 0, Math.PI / 2);

console.log(pb.toString());