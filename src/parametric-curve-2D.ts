import {Point2D} from "./point2D.js";
import {Vector2D} from "./vector2D.js";

const EPS = 1e-4;

/**
 * Base class for 2D parametric curves. Subclasses provide a point sampler,
 * while this class offers default finite-difference estimates for derivatives, which can be overridden by subclasses with actual formula methods.
 */
export abstract class ParametricCurve2D {
    /** Evaluate the curve at the parameter `t`. */
    public abstract at(t: number): Point2D;

    public tangentAt(t: number) {
        // Approximate the tangent vector at parameter `t` using a central difference
        const p0 = this.at(t - EPS);
        const p1 = this.at(t + EPS);
        return Vector2D.from(p0, p1).scale(1 / (2 * EPS));
    }

    public accelerationAt(t: number) {
        // Approximate the second derivative at `t` with a five-point stencil.
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