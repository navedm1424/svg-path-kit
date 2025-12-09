import { Point2D, Vector2D } from "./svg";
export declare abstract class Command {
    readonly mode: 'relative' | 'absolute';
    constructor(mode?: 'relative' | 'absolute');
    protected coordinates(point: Point2D | Vector2D): string;
    abstract toString(): string;
    abstract getEndPoint(): Point2D;
}
export declare class MoveCommand extends Command {
    readonly startingPoint: Point2D;
    readonly endPoint: Vector2D;
    constructor(startingPoint: Point2D, endPoint: Vector2D, mode?: 'relative' | 'absolute');
    toString(): string;
    getEndPoint(): Point2D;
}
export declare class LineCommand extends Command {
    readonly startingPoint: Point2D;
    readonly endPoint: Vector2D;
    constructor(startingPoint: Point2D, endPoint: Vector2D, mode?: 'relative' | 'absolute');
    toString(): string;
    getEndPoint(): Point2D;
}
export declare class QuadraticBezierCurveCommand extends Command {
    readonly startingPoint: Point2D;
    readonly controlPoint: Vector2D;
    readonly endPoint: Vector2D;
    constructor(startingPoint: Point2D, controlPoint: Vector2D, endPoint: Vector2D, mode?: 'relative' | 'absolute');
    toString(): string;
    getEndPoint(): Point2D;
}
export declare class CubicBezierCurveCommand extends Command {
    readonly startingPoint: Point2D;
    readonly firstControlPoint: Vector2D;
    readonly secondControlPoint: Vector2D;
    readonly endPoint: Vector2D;
    constructor(startingPoint: Point2D, firstControlPoint: Vector2D, secondControlPoint: Vector2D, endPoint: Vector2D, mode?: 'relative' | 'absolute');
    toString(): string;
    getEndPoint(): Point2D;
}
export declare class EllipticalArcCommand extends Command {
    readonly startingPoint: Point2D;
    readonly xRadius: number;
    readonly yRadius: number;
    readonly xAxisRotation: number;
    readonly largeArcFlag: 0 | 1;
    readonly sweepFlag: 0 | 1;
    readonly endPoint: Vector2D;
    constructor(startingPoint: Point2D, xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, endPoint: Vector2D, mode?: 'relative' | 'absolute');
    toString(): string;
    getEndPoint(): Point2D;
}
export declare class ClosePathCommand extends Command {
    readonly pathStart: MoveCommand;
    constructor(pathStart: MoveCommand, mode?: 'relative' | 'absolute');
    toString(): string;
    getEndPoint(): Point2D;
}
export declare class Path {
    readonly commands: Command[];
    constructor(commands: Command[]);
    toString(): string;
}
export declare class PathBuilder {
    private commands;
    private openPathStack;
    get currentPosition(): Point2D;
    get lastCommand(): Command | null;
    private constructor();
    static m(point: Vector2D): PathBuilder;
    static M(point: Point2D): PathBuilder;
    m(point: Vector2D): this;
    M(point: Point2D): this;
    l(point: Vector2D): this;
    L(point: Point2D): this;
    q(controlPoint: Vector2D, endPoint: Vector2D): this;
    Q(controlPoint: Point2D, endPoint: Point2D): this;
    c(firstControlPoint: Vector2D, secondControlPoint: Vector2D, endPoint: Vector2D): this;
    C(firstControlPoint: Point2D, secondControlPoint: Point2D, endPoint: Point2D): this;
    a(xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, endPoint: Vector2D): this;
    A(xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, endPoint: Point2D): this;
    cForCircularArc(angle: number, endingPoint: Vector2D): PathBuilder;
    cForCircularArc(center: Vector2D, angle: number): PathBuilder;
    CForCircularArc(angle: number, endingPoint: Point2D): PathBuilder;
    CForCircularArc(center: Point2D, angle: number): PathBuilder;
    cForEllipticalArc(center: Vector2D, angle: number, axisRatio: number, ellipseRotation?: number): this;
    CForEllipticalArc(center: Point2D, angle: number, axisRatio: number, ellipseRotation?: number): this;
    cAutoControl(endingPoint: Vector2D, startAngle?: number, endAngle?: number, curvatureA?: number, curvatureB?: number): this;
    CAutoControl(endingPoint: Point2D, startAngle?: number, endAngle?: number, curvatureA?: number, curvatureB?: number): this;
    z(): this;
    toPath(): Path;
    toString(): string;
}
