import {
    cubicBezierAutoControl,
    cubicBezierCurveForCircularArc,
    cubicBezierCurveForEllipticalArc
} from "./cubic-bezier-curve";
import { round } from "../utils/math";
import { Vector2D } from "./vector2D";
import { Point2D } from "./point2D";

export enum CommandMode {
    RELATIVE='relative',
    ABSOLUTE='absolute'
}

export abstract class Command {
    readonly endingPoint: Point2D;
    protected readonly endingPointVector: Vector2D;
    readonly mode: CommandMode;

    protected constructor(
        readonly startingPoint: Point2D,
        endingPoint: Point2D | Vector2D,
    ) {
        if (endingPoint instanceof Vector2D) {
            this.endingPointVector = endingPoint;
            this.endingPoint = this.startingPoint.add(endingPoint);
            this.mode = CommandMode.RELATIVE;
        } else {
            this.endingPoint = endingPoint;
            this.endingPointVector = Vector2D.from(this.startingPoint, endingPoint);
            this.mode = CommandMode.ABSOLUTE;
        }
    }

    protected coordinates(point: Point2D | Vector2D) {
        return `${round(point.x, 4)} ${round(point.y, 4)}`;
    }

    public abstract toString(): string;
    public abstract getEndDirection(): Vector2D | undefined;
}

export class MoveCommand extends Command {
    private constructor(
        startingPoint: Point2D,
        endingPoint: Point2D | Vector2D
    ) {
        super(startingPoint, endingPoint);
    }
    public static absolute(startingPoint: Point2D, endingPoint: Point2D) {
        return new MoveCommand(startingPoint, endingPoint);
    }
    public static relative(startingPoint: Point2D, endingPointVector: Vector2D) {
        return new MoveCommand(startingPoint, endingPointVector);
    }

    public toString() {
        const cmd = this.mode === CommandMode.RELATIVE ? 'm' : 'M';
        const point = this.mode === CommandMode.RELATIVE ? this.endingPointVector : this.endingPoint;
        return `${cmd} ${this.coordinates(point)}`;
    }

    public getEndDirection(): Vector2D {
        return this.endingPointVector.unit();
    }
}

export class LineCommand extends Command {
    private constructor(
        startingPoint: Point2D,
        endingPoint: Point2D | Vector2D
    ) {
        super(startingPoint, endingPoint);
    }
    public static absolute(startingPoint: Point2D, endingPoint: Point2D) {
        return new LineCommand(startingPoint, endingPoint);
    }
    public static relative(startingPoint: Point2D, endingPointVector: Vector2D) {
        return new LineCommand(startingPoint, endingPointVector);
    }

    public toString() {
        const cmd = this.mode === CommandMode.RELATIVE ? 'l' : 'L';
        const end = this.mode === CommandMode.RELATIVE ? this.endingPointVector : this.endingPoint;
        return `${cmd} ${this.coordinates(end)}`;
    }

    public getEndDirection(): Vector2D {
        return this.endingPointVector.unit();
    }
}

export class QuadraticBezierCurveCommand extends Command {
    readonly controlPoint: Vector2D;
    private constructor(
        startingPoint: Point2D,
        controlPoint: Point2D | Vector2D,
        endingPoint: Point2D | Vector2D,
    ) {
        super(startingPoint, endingPoint);
        if (controlPoint instanceof Vector2D)
            this.controlPoint = controlPoint;
        else
            this.controlPoint = Vector2D.from(startingPoint, controlPoint);
    }
    public static absolute(startingPoint: Point2D, controlPoint: Point2D, endingPoint: Point2D) {
        return new QuadraticBezierCurveCommand(startingPoint, controlPoint, endingPoint);
    }
    public static relative(startingPoint: Point2D, controlPoint: Vector2D, endingPoint: Vector2D) {
        return new QuadraticBezierCurveCommand(startingPoint, controlPoint, endingPoint);
    }

    public toString() {
        const cmd = this.mode === CommandMode.RELATIVE ? 'q' : 'Q';
        const cp = this.mode === CommandMode.RELATIVE ? this.controlPoint : this.startingPoint.add(this.controlPoint);
        const ep = this.mode === CommandMode.RELATIVE ? this.endingPointVector : this.endingPoint;
        return `${cmd} ${this.coordinates(cp)} ${this.coordinates(ep)}`;
    }

    public getEndDirection(): Vector2D {
        return this.endingPointVector.subtract(this.controlPoint).unit();
    }
}

export class CubicBezierCurveCommand extends Command {
    readonly firstControlPoint: Vector2D;
    readonly secondControlPoint: Vector2D;
    private constructor(
        startingPoint: Point2D,
        firstControlPoint: Point2D | Vector2D,
        secondControlPoint: Point2D | Vector2D,
        endingPoint: Point2D | Vector2D
    ) {
        super(startingPoint, endingPoint);
        if (firstControlPoint instanceof Vector2D)
            this.firstControlPoint = firstControlPoint;
        else
            this.firstControlPoint = Vector2D.from(startingPoint, firstControlPoint);
        if (secondControlPoint instanceof Vector2D)
            this.secondControlPoint = secondControlPoint;
        else
            this.secondControlPoint = Vector2D.from(startingPoint, secondControlPoint);
    }
    public static absolute(startingPoint: Point2D, firstControlPoint: Point2D, secondControlPoint: Point2D, endingPoint: Point2D) {
        return new CubicBezierCurveCommand(startingPoint, firstControlPoint, secondControlPoint, endingPoint);
    }
    public static relative(startingPoint: Point2D, firstControlPoint: Vector2D, secondControlPoint: Vector2D, endingPoint: Vector2D) {
        return new CubicBezierCurveCommand(startingPoint, firstControlPoint, secondControlPoint, endingPoint);
    }

    public toString() {
        const cmd = this.mode === CommandMode.RELATIVE ? 'c' : 'C';
        const cp1 = this.mode === CommandMode.RELATIVE ? this.firstControlPoint : this.startingPoint.add(this.firstControlPoint);
        const cp2 = this.mode === CommandMode.RELATIVE ? this.secondControlPoint : this.startingPoint.add(this.secondControlPoint);
        const ep = this.mode === CommandMode.RELATIVE ? this.endingPointVector : this.endingPointVector;
        return `${cmd} ${this.coordinates(cp1)} ${this.coordinates(cp2)} ${this.coordinates(ep)}`;
    }

    public getEndDirection(): Vector2D {
        return this.endingPointVector.subtract(this.secondControlPoint).unit();
    }
}

export class EllipticalArcCommand extends Command {
    private constructor(
        startingPoint: Point2D,
        readonly xRadius: number,
        readonly yRadius: number,
        readonly xAxisRotation: number,
        readonly largeArcFlag: 0 | 1,
        readonly sweepFlag: 0 | 1,
        endingPoint: Point2D | Vector2D
    ) {
        super(startingPoint, endingPoint);
    }
    public static absolute(
        startingPoint: Point2D,
        xRadius: number,
        yRadius: number,
        xAxisRotation: number,
        largeArcFlag: 0 | 1,
        sweepFlag: 0 | 1,
        endingPoint: Point2D
    ) {
        return new EllipticalArcCommand(
            startingPoint,
            xRadius,
            yRadius,
            xAxisRotation,
            largeArcFlag,
            sweepFlag,
            endingPoint,
        );
    }
    public static relative(
        startingPoint: Point2D,
        xRadius: number,
        yRadius: number,
        xAxisRotation: number,
        largeArcFlag: 0 | 1,
        sweepFlag: 0 | 1,
        endingPoint: Vector2D
    ) {
        return new EllipticalArcCommand(
            startingPoint,
            xRadius,
            yRadius,
            xAxisRotation,
            largeArcFlag,
            sweepFlag,
            endingPoint,
        );
    }

    public toString() {
        const cmd = this.mode === CommandMode.RELATIVE ? 'a' : 'A';
        const ep = this.mode === CommandMode.RELATIVE ? this.endingPointVector : this.endingPoint;
        return `${cmd} ${this.xRadius} ${this.yRadius} ${this.xAxisRotation} ${this.largeArcFlag} ${this.sweepFlag} ${this.coordinates(ep)}`;
    }

    // TODO: Write the actual implementation
    public getEndDirection(): Vector2D | undefined {
        return undefined;
    }
}

export class ClosePathCommand extends Command {
    private constructor(
        startingPoint: Point2D,
        endingPoint: Point2D | Vector2D
    ) {
        super(startingPoint, endingPoint);
    }
    public static absolute(startingPoint: Point2D, endingPoint: Point2D) {
        return new ClosePathCommand(startingPoint, endingPoint);
    }
    public static relative(startingPoint: Point2D, endingPointVector: Vector2D) {
        return new ClosePathCommand(startingPoint, endingPointVector);
    }

    public toString() {
        return `z`;
    }

    public getEndDirection(): Vector2D | undefined {
        return this.endingPointVector.unit();
    }
}

export class Path {
    constructor(readonly commands: Command[]) { }

    public toString() {
        return this.commands.map(c => c.toString()).join(' ');
    }
}

export class PathBuilder {
    private commands: Command[] = [];
    private openPathStack: MoveCommand[] = [];

    get currentPosition() {
        return this.lastCommand?.endingPoint ?? Point2D.of(0, 0);
    }
    get lastCommand() {
        return this.commands.length === 0 ?
            null : this.commands[this.commands.length - 1];
    }

    private constructor(point: Vector2D | Point2D) {
        if (point instanceof Vector2D)
            this.m(point);
        else
            this.M(point);
    }

    public static m(point: Vector2D) {
        return new PathBuilder(point);
    }

    public static M(point: Point2D) {
        return new PathBuilder(point);
    }


    // Relative move
    public m(point: Vector2D) {
        const startingPoint = this.currentPosition;
        const moveCommand = MoveCommand.relative(startingPoint, point);
        this.commands.push(moveCommand);
        this.openPathStack.push(moveCommand);
        return this;
    }

    // Absolute move
    public M(point: Point2D) {
        const startingPoint = this.currentPosition;
        const moveCommand = MoveCommand.absolute(startingPoint, point);
        this.commands.push(moveCommand);
        this.openPathStack.push(moveCommand);
        return this;
    }

    // Relative line
    public l(point: Vector2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(LineCommand.relative(startingPoint, point));
        return this;
    }

    // Absolute line
    public L(point: Point2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(LineCommand.absolute(startingPoint, point));
        return this;
    }

    // Relative quadratic Bézier curve
    public q(controlPoint: Vector2D, endPoint: Vector2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(QuadraticBezierCurveCommand.relative(startingPoint, controlPoint, endPoint));
        return this;
    }

    // Absolute quadratic Bézier curve
    public Q(controlPoint: Point2D, endingPoint: Point2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(QuadraticBezierCurveCommand.absolute(startingPoint, controlPoint, endingPoint));
        return this;
    }

    // Relative cubic Bézier curve
    public c(firstControlPoint: Vector2D, secondControlPoint: Vector2D, endingPoint: Vector2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(CubicBezierCurveCommand.relative(startingPoint, firstControlPoint, secondControlPoint, endingPoint));
        return this;
    }

    // Absolute cubic Bézier curve
    public C(firstControlPoint: Point2D, secondControlPoint: Point2D, endingPoint: Point2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(CubicBezierCurveCommand.absolute(startingPoint, firstControlPoint, secondControlPoint, endingPoint));
        return this;
    }

    // Relative elliptical arc (lowercase)
    public a(
        xRadius: number,
        yRadius: number,
        xAxisRotation: number,
        largeArcFlag: 0 | 1,
        sweepFlag: 0 | 1,
        endPoint: Vector2D
    ) {
        const startingPoint = this.currentPosition;
        this.commands.push(EllipticalArcCommand.relative(startingPoint, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint));
        return this;
    }

    // Absolute elliptical arc (uppercase)
    public A(
        xRadius: number,
        yRadius: number,
        xAxisRotation: number,
        largeArcFlag: 0 | 1,
        sweepFlag: 0 | 1,
        endPoint: Point2D
    ) {
        const startingPoint = this.currentPosition;
        this.commands.push(EllipticalArcCommand.absolute(startingPoint, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint));
        return this;
    }

    // Relative arc by cubic Bézier
    public cForCircularArc(angle: number, endingPoint: Vector2D): PathBuilder;
    public cForCircularArc(center: Vector2D, angle: number): PathBuilder;

    public cForCircularArc(
        ...args: [angle: number, endingPoint: Vector2D] |
        [center: Vector2D, angle: number]
    ) {
        const startingPoint = this.currentPosition;
        let cubicBezierCurve;
        const origin = Point2D.of(0, 0);
        if (typeof args[0] === "number" && args[1] instanceof Vector2D) {
            cubicBezierCurve = cubicBezierCurveForCircularArc(origin, args[0], args[1].toPoint());
        } else if (args[0] instanceof Vector2D && typeof args[1] === "number") {
            cubicBezierCurve = cubicBezierCurveForCircularArc(args[0].toPoint(), origin, args[1]);
        } else {
            throw new Error("Invalid Arguments");
        }

        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        this.commands.push(CubicBezierCurveCommand.relative(
            startingPoint,
            firstControlPoint.toVector(),
            secondControlPoint.toVector(),
            endingPoint.toVector()
        ));
        return this;
    }

    // Absolute arc by cubic Bézier
    public CForCircularArc(angle: number, endingPoint: Point2D): PathBuilder;
    public CForCircularArc(center: Point2D, angle: number): PathBuilder;

    public CForCircularArc(
        ...args: [angle: number, endingPoint: Point2D] |
        [center: Point2D, angle: number]
    ) {
        const startingPoint = this.currentPosition;
        let cubicBezierCurve;
        if (typeof args[0] === "number" && args[1] instanceof Point2D) {
            cubicBezierCurve = cubicBezierCurveForCircularArc(startingPoint, args[0], args[1]);
        } else if (args[0] instanceof Point2D && typeof args[1] === "number") {
            cubicBezierCurve = cubicBezierCurveForCircularArc(args[0], startingPoint, args[1]);
        } else {
            throw new Error("Invalid Arguments");
        }

        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        this.commands.push(CubicBezierCurveCommand.absolute(
            startingPoint,
            firstControlPoint,
            secondControlPoint,
            endingPoint
        ));
        return this;
    }

    public cForEllipticalArc(
        center: Vector2D, angle: number, axisRatio: number, ellipseRotation: number = 0
    ) {
        const startingPoint = this.currentPosition;
        const origin = Point2D.of(0, 0);
        const cubicBezierCurve = cubicBezierCurveForEllipticalArc(center.toPoint(), origin, angle, axisRatio, ellipseRotation);
        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        this.commands.push(CubicBezierCurveCommand.relative(
            startingPoint,
            firstControlPoint.toVector(),
            secondControlPoint.toVector(),
            endingPoint.toVector()
        ));
        return this;
    }

    public CForEllipticalArc(
        center: Point2D, angle: number, axisRatio: number, ellipseRotation: number = 0
    ) {
        const startingPoint = this.currentPosition;
        const cubicBezierCurve = cubicBezierCurveForEllipticalArc(center, startingPoint, angle, axisRatio, ellipseRotation);
        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        this.commands.push(CubicBezierCurveCommand.absolute(
            startingPoint,
            firstControlPoint,
            secondControlPoint,
            endingPoint
        ));
        return this;
    }

    // Relative smooth cubic Bézier curve (with optional angles and curvatures)
    public cAutoControl(
        endingPoint: Vector2D,
        startAngle?: number, endAngle?: number,
        startHandleScale: number = 1 / 3,
        endHandleScale: number = startHandleScale
    ) {
        const startingPoint = this.currentPosition;

        const startDirection: Vector2D | null = startAngle !== undefined ?
            Vector2D.of(Math.cos(startAngle), Math.sin(startAngle)):
            this.lastCommand?.getEndDirection() ?? null;
        const endDirection: Vector2D | null = endAngle !== undefined ?
            Vector2D.of(Math.cos(endAngle), Math.sin(endAngle)):
            null;
        const origin = Point2D.of(0, 0);
        const { firstControlPoint, secondControlPoint } = cubicBezierAutoControl(
            origin, endingPoint.toPoint(),
            startDirection ?? undefined, endDirection ?? undefined,
            startHandleScale, endHandleScale
        );
        this.commands.push(CubicBezierCurveCommand.relative(
            startingPoint,
            firstControlPoint.toVector(),
            secondControlPoint.toVector(),
            endingPoint
        ));
        return this;
    }
    public CAutoControl(
        endingPoint: Point2D,
        startAngle?: number, endAngle?: number,
        startHandleScale: number = 1 / 3,
        endHandleScale: number = startHandleScale
    ) {
        const startingPoint = this.currentPosition;

        const startDirection: Vector2D | null = startAngle !== undefined ?
            Vector2D.of(Math.cos(startAngle), Math.sin(startAngle)):
            this.lastCommand?.getEndDirection() ?? null;
        const endDirection: Vector2D | null = endAngle !== undefined ?
            Vector2D.of(Math.cos(endAngle), Math.sin(endAngle)):
            null;
        const { firstControlPoint, secondControlPoint } = cubicBezierAutoControl(
            startingPoint, endingPoint,
            startDirection ?? undefined, endDirection ?? undefined,
            startHandleScale, endHandleScale
        );
        this.commands.push(CubicBezierCurveCommand.absolute(
            startingPoint,
            firstControlPoint,
            secondControlPoint,
            endingPoint
        ));
        return this;
    }

    public z() {
        const startingPoint = this.currentPosition;
        const endingPoint = this.openPathStack.pop()!.endingPoint;
        this.commands.push(ClosePathCommand.absolute(startingPoint, endingPoint));
        return this;
    }

    public toPath() {
        return new Path(this.commands);
    }

    public toString() {
        return this.toPath().toString();
    }
}
