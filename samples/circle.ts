import {PathBuilder, Point2D, Vector2D} from "../src/index";
import {ParametricCurve2D} from "../src/parametric-curve-2D";
import {fitSplineTo} from "../src/spline-functions";

const circle = new (class extends ParametricCurve2D {
    constructor(readonly radius: number) {
        super();
    }

    at(t: number): Point2D {
        return Point2D.of(this.radius * Math.cos(t), this.radius * Math.sin(t));
    }
    tangentAt(t: number): Vector2D {
        return Vector2D.of(-this.radius * Math.sin(t), this.radius * Math.cos(t));
    }
    accelerationAt(t: number): Vector2D {
        return Vector2D.of(-this.radius * Math.cos(t), -this.radius * Math.sin(t));
    }
})(2);

const pb = PathBuilder.m(Point2D.ORIGIN);

fitSplineTo(pb, circle, 0, 2 * Math.PI);
// pb.m(Point2D.ORIGIN);
// pb.bezierCircularArc(2, 0, Math.PI / 2);

console.log(pb.toString());