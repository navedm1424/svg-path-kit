import {PathBuilder, Point2D, Vector2D} from "../src/index";
import {fitSplineAtParams} from "../src/spline-functions";
import {ParametricCurve2D} from "../src/parametric-curve-2D";

const superellipse = new (class extends ParametricCurve2D {
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

    tangentAt(t: number): Vector2D {
        const cosine = Math.cos(t);
        const sine = Math.sin(t);
        const x = -this.exp * this.a * Math.sign(cosine) * sine * Math.pow(Math.abs(cosine), this.exp - 1);
        const y = this.exp * this.b * Math.sign(sine) * cosine * Math.pow(Math.abs(sine), this.exp - 1);
        if (!(Number.isFinite(x) && Number.isFinite(y)))
            return super.tangentAt(t);

        return Vector2D.of(x, y);
    }
})(5, 5, 2);

const pb = PathBuilder.m(Point2D.ORIGIN);

fitSplineAtParams(pb, superellipse, 0, Math.PI / 28, Math.PI / 4, 13 * Math.PI / 28, Math.PI / 2);

console.log(pb.toString());