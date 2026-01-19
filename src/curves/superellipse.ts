import {Point2D, Vector2D} from "../index";
import {ParametricCurve2D} from "../parametric-curve-2D";

export class Superellipse extends ParametricCurve2D {
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
        const x = -this.exp * this.a * sine * Math.pow(Math.abs(cosine), this.exp - 1);
        const y = this.exp * this.b * cosine * Math.pow(Math.abs(sine), this.exp - 1);
        if (!(Number.isFinite(x) && Number.isFinite(y)))
            return super.tangentAt(t);

        return Vector2D.of(x, y);
    }
}