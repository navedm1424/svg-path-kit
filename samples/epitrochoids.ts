import {CubicBezierCurve, PathBuilder, Point2D, Vector2D} from "../src/index";
import {Curve} from "../src/curve";
import {fitCurve} from "../src/spline-functions";

const epitrochoids = new (class extends Curve {
    constructor(
        readonly statorRadius: number,
        readonly rotorRadius: number,
        readonly penDistance: number
    ) {
        super();
    }

    at(t: number): Point2D {
        const radiiSum = this.statorRadius + this.rotorRadius;
        const quotient = radiiSum / this.rotorRadius;
        return Point2D.of(
            radiiSum * Math.cos(t) - this.penDistance * Math.cos(t * quotient),
            radiiSum * Math.sin(t) - this.penDistance * Math.sin(t * quotient)
        );
    }
    tangentAt(t: number): Vector2D {
        const radiiSum = this.statorRadius + this.rotorRadius;
        const quotient = radiiSum / this.rotorRadius;
        return Vector2D.of(
            - radiiSum * Math.sin(t) + this.penDistance * quotient * Math.sin(t * quotient),
            radiiSum * Math.cos(t) - this.penDistance * quotient * Math.cos(t * quotient)
        );
    }
})(10, 6, 7);

const pb = PathBuilder.m(Point2D.ORIGIN);

const spline: CubicBezierCurve[] = fitCurve(epitrochoids, 0, 12 * Math.PI, 0.25);
console.log(spline.length);
spline.forEach(c => pb.c(
    Vector2D.from(c.startingPoint, c.firstControlPoint),
    Vector2D.from(c.startingPoint, c.secondControlPoint),
    Vector2D.from(c.startingPoint, c.endingPoint)
));

console.log(pb.toString());