import {Point2D} from "./point2D";
import {Vector2D} from "./vector2D";

const EPS = 1e-4;
export abstract class ParametricCurve2D {
    public abstract at(t: number): Point2D;
    public tangentAt(t: number) {
        const p0 = this.at(t - EPS);
        const p1 = this.at(t + EPS);
        return Vector2D.from(p0, p1).scale(1 / (2 * EPS));
    }
    public accelerationAt(t: number) {
        const p0 = this.at(t - 2 * EPS);
        const p1 = this.at(t - EPS);
        const p = this.at(t);
        const p2 = this.at(t + EPS);
        const p3 = this.at(t + 2 * EPS);

        return Vector2D.of(
            -p3.x + 16 * p2.x - 30 * p.x + 16 * p1.x - p0.x,
            -p3.y + 16 * p2.y - 30 * p.y + 16 * p1.y - p0.y
        ).scale(1 / (12 * EPS * EPS));
    }
}