import {CubicBezierCurve, PathBuilder, Point2D, Vector2D} from "../src/index";
import {fitCurve} from "../src/spline-functions";
import {Curve} from "../src/curve";

const superellipse = new (class extends Curve {
    private readonly exp: number;
    constructor(
        readonly a: number,
        readonly b: number,
        readonly n: number
    ) {
        super();
        this.exp = 2 ** (1 - n);
    }

    at(t: number): Point2D {
        const cosine = Math.cos(t);
        const sine = Math.sin(t);
        return Point2D.of(
            this.a * Math.sign(cosine) * Math.pow(Math.abs(cosine), this.exp),
            this.b * Math.sign(sine) * Math.pow(Math.abs(sine), this.exp)
        );
    }

    // tangentAt(t: number): Vector2D {
    //     const cosine = Math.cos(t);
    //     const sine = Math.sin(t);
    //     return Vector2D.of(
    //         -this.exp * this.a * Math.sign(cosine) * sine * Math.pow(Math.abs(cosine), this.exp - 1),
    //         this.exp * this.b * Math.sign(sine) * cosine * Math.pow(Math.abs(sine), this.exp - 1)
    //     );
    // }
})(5, 5, 2);

const pb = PathBuilder.m(Point2D.ORIGIN);

const spline: CubicBezierCurve[] = fitCurve(superellipse, Math.PI / 2, 0, 0.25);
console.log(spline.length);
spline.forEach(c => pb.c(
    Vector2D.from(c.startingPoint, c.firstControlPoint),
    Vector2D.from(c.startingPoint, c.secondControlPoint),
    Vector2D.from(c.startingPoint, c.endingPoint)
));

console.log(pb.toString());