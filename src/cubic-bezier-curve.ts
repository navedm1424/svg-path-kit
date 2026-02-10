import {Vector2D} from "./vector2D";
import {Point2D} from "./point2D";
import {ParametricCurve2D} from "./parametric-curve-2D";
import {makePropertiesReadonly} from "./utils/object-utils";

/**
 * Cubic Bézier curve with helpers for evaluation and subdivision.
 */
export class CubicBezierCurve extends ParametricCurve2D {
    constructor(
        readonly startingPoint: Point2D,
        readonly firstControlPoint: Point2D,
        readonly secondControlPoint: Point2D,
        readonly endingPoint: Point2D
    ) {
        super();
        makePropertiesReadonly(this, "startingPoint", "firstControlPoint", "secondControlPoint", "endingPoint");
    }

    public at(t: number): Point2D {
        const u = 1 - t;
    
        const p0 = this.startingPoint;
        const p1 = this.firstControlPoint;
        const p2 = this.secondControlPoint;
        const p3 = this.endingPoint;
    
        const x =
            u*u*u * p0.x +
            3*u*u*t * p1.x +
            3*u*t*t * p2.x +
            t*t*t * p3.x;
    
        const y =
            u*u*u * p0.y +
            3*u*u*t * p1.y +
            3*u*t*t * p2.y +
            t*t*t * p3.y;
    
        return Point2D.of(x, y);
    }

    public tangentAt(t: number): Vector2D {
        const u = 1 - t;
    
        const p0 = this.startingPoint;
        const p1 = this.firstControlPoint;
        const p2 = this.secondControlPoint;
        const p3 = this.endingPoint;
    
        const dx =
            3*u*u * (p1.x - p0.x) +
            6*u*t * (p2.x - p1.x) +
            3*t*t * (p3.x - p2.x);
    
        const dy =
            3*u*u * (p1.y - p0.y) +
            6*u*t * (p2.y - p1.y) +
            3*t*t * (p3.y - p2.y);
    
        return Vector2D.of(dx, dy);
    }

    public accelerationAt(t: number) {
        const u = 1 - t;
        const P0 = this.startingPoint;
        const P1 = this.firstControlPoint;
        const P2 = this.secondControlPoint;
        const P3 = this.endingPoint;
        return Vector2D.of(
            6 * (P2.x - 2 * P1.x + P0.x) * u +
            6 * (P3.x - 2 * P2.x + P1.x) * t,
            6 * (P2.y - 2 * P1.y + P0.y) * u +
            6 * (P3.y - 2 * P2.y + P1.y) * t,
        );
    }

    private lerp(a: Point2D, b: Point2D, t: number) {
        return Point2D.of(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    }    

    /**
     * Split the curve at parameter `t` and return the requested side.
     */
    public splitAt(
        t: number,
        side: 'left' | 'right' = 'left'
    ) {
        const q0 = this.lerp(this.startingPoint, this.firstControlPoint, t);
        const q1 = this.lerp(this.firstControlPoint, this.secondControlPoint, t);
        const q2 = this.lerp(this.secondControlPoint, this.endingPoint, t);
    
        const r0 = this.lerp(q0, q1, t);
        const r1 = this.lerp(q1, q2, t);
    
        const s = this.lerp(r0, r1, t);
    
        if (side === 'left')
            return new CubicBezierCurve(this.startingPoint, q0, r0, s);
    
        const rel = (p: Point2D): Point2D => Point2D.of(p.x - s.x, p.y - s.y);
      
        return new CubicBezierCurve(Point2D.of(0, 0), rel(r1), rel(q2), rel(this.endingPoint));
    }
}