import {CubicBezierCurve, PathBuilder, Point2D, Vector2D} from "../src/index";
import {Curve} from "../src/curve";
import {fitCurve} from "../src/spline-functions";

const epitrochoids = new (class extends Curve {
    constructor(
        readonly fixedCircleRadius: number,
        readonly rollingCircleRadius: number,
        readonly distance: number
    ) {
        super();
    }

    at(t: number): Point2D {
        const radiiSum = this.fixedCircleRadius + this.rollingCircleRadius;
        const quotient = radiiSum / this.rollingCircleRadius;
        return Point2D.of(
            radiiSum * Math.cos(t) - this.distance * Math.cos(t * quotient),
            radiiSum * Math.sin(t) - this.distance * Math.sin(t * quotient)
        );
    }
    tangentAt(t: number): Vector2D {
        const radiiSum = this.fixedCircleRadius + this.rollingCircleRadius;
        const quotient = radiiSum / this.rollingCircleRadius;
        return Vector2D.of(
            - radiiSum * Math.sin(t) + this.distance * quotient * Math.sin(t * quotient),
            radiiSum * Math.cos(t) - this.distance * quotient * Math.cos(t * quotient)
        );
    }
})(3, 0.98, 20);

const pb = PathBuilder.m(Point2D.ORIGIN);

const spline: CubicBezierCurve[] = fitCurve(epitrochoids, 0, 79 * Math.PI / 10, 0.25);
console.log(spline.length);
spline.forEach(c => pb.c(
    Vector2D.from(c.startingPoint, c.firstControlPoint),
    Vector2D.from(c.startingPoint, c.secondControlPoint),
    Vector2D.from(c.startingPoint, c.endingPoint)
));

console.log(pb.toString());