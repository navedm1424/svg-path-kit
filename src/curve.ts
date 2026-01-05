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
    // public accelerationAt(t: number) {
    //     const eps = 1e-4;
    //     const p0 = this.at(t - eps);
    //     const p = this.at(t);
    //     const p1 = this.at(t + eps);
    //     // ddx = (x(t+h) - 2*x(t) + x(t-h)) / (h*h)
    //     // ddy = (y(t+h) - 2*y(t) + y(t-h)) / (h*h)
    //     return Vector2D.of(
    //         p1.x - 2 * p.x + p0.x,
    //         p1.y - 2 * p.y + p0.y
    //     ).scale(1 / (eps * eps));
    // }
    // public curvature(t: number) {
    //     const tangent = this.tangentAt(t);
    //     const acceleration = this.accelerationAt(t);
    //     const num = Math.abs(tangent.crossProduct(acceleration));
    //     const den = Math.pow(tangent.magnitude, 3);
    //     return num / den;
    // }
}