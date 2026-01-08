import {Point2D} from "./point2D";
import {Vector2D} from "./vector2D";

export abstract class Curve {
    public abstract at(t: number): Point2D;
    public tangentAt(t: number) {
        const eps = 1e-4;
        const p0 = this.at(t - eps);
        const p1 = this.at(t + eps);
        return Vector2D.from(p0, p1).scale(1 / (2 * eps));
    }
    public accelerationAt(t: number) {
        const eps = 1e-4;

        const p0 = this.at(t - 2 * eps);
        const p1 = this.at(t - eps);
        const p = this.at(t);
        const p2 = this.at(t + eps);
        const p3 = this.at(t + 2 * eps);

        return Vector2D.of(
            -p3.x + 16 * p2.x - 30 * p.x + 16 * p1.x - p0.x,
            -p3.y + 16 * p2.y - 30 * p.y + 16 * p1.y - p0.y
        ).scale(1 / (12 * eps * eps));
    }

    // public curvature(t: number) {
    //     const tangent = this.tangentAt(t);
    //     const acceleration = this.accelerationAt(t);
    //     const num = Math.abs(tangent.crossProduct(acceleration));
    //     const den = Math.pow(tangent.magnitude, 3);
    //     return num / den;
    // }
}