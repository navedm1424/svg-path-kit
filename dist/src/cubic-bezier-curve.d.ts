import { Point2D, Vector2D } from "./svg";
export declare class CubicBezierCurve {
    readonly startingPoint: Point2D;
    readonly firstControlPoint: Point2D;
    readonly secondControlPoint: Point2D;
    readonly endingPoint: Point2D;
    constructor(startingPoint: Point2D, firstControlPoint: Point2D, secondControlPoint: Point2D, endingPoint: Point2D);
    getPointAt(t: number): Point2D;
    getTangentAt(t: number): Vector2D;
    private lerp;
    splitAt(t: number, side?: 'left' | 'right'): CubicBezierCurve;
}
export declare function cubicBezierCurveForCircularArc(startingPoint: Point2D, angle: number, endingPoint: Point2D): CubicBezierCurve;
export declare function cubicBezierCurveForCircularArc(center: Point2D, startingPoint: Point2D, angle: number): CubicBezierCurve;
export declare function cubicBezierCurveForEllipticalArc(center: Point2D, startingPoint: Point2D, centralAngle: number, ratio: number, phi: number): CubicBezierCurve;
export declare function cubicBezierAutoControl(startingPoint: Point2D, endingPoint: Point2D, startDirection?: Vector2D, // tangent vector out of the starting point
endDirection?: Vector2D, // tangent vector into the ending point
tensionA?: number, // fraction of chord length for handle distance
tensionB?: number): CubicBezierCurve;
