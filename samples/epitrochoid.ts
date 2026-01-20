import {PathBuilder, Point2D, Vector2D} from "../src/index";
import {ParametricCurve2D} from "../src/parametric-curve-2D";
import {fitSplineTo} from "../src/spline-fitting";

class Epitrochoid extends ParametricCurve2D {
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
            -radiiSum * Math.sin(t) + this.penDistance * quotient * Math.sin(t * quotient),
            radiiSum * Math.cos(t) - this.penDistance * quotient * Math.cos(t * quotient)
        );
    }

    accelerationAt(t: number): Vector2D {
        const radiiSum = this.statorRadius + this.rotorRadius;
        const quotient = radiiSum / this.rotorRadius;
        return Vector2D.of(
            -radiiSum * Math.cos(t) - this.penDistance * (quotient ** 2) * Math.cos(t * quotient),
            -radiiSum * Math.sin(t) - this.penDistance * (quotient ** 2) * Math.sin(t * quotient)
        );
    }
}

const epitrochoid = new Epitrochoid(10, 6, 7);

const pb = PathBuilder.m(Point2D.ORIGIN);

fitSplineTo(pb, epitrochoid, 0, 12 * Math.PI);

console.log(pb.toSVGPathString());