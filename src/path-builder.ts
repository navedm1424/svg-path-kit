import {Point2D} from "./point2D";
import {Vector2D} from "./vector2D";
import {CircularArc, EllipticalArc} from "./curves/index";
import {
    ChordScaledBezierCommand,
    ClosePathCommand,
    Command,
    CubicBezierCurveCommand,
    CubicBezierEllipticalArc,
    CubicBezierHermiteCurveCommand,
    EllipticalArcCommand,
    EllipticalArcWrapperCommand,
    LineCommand,
    MoveCommand, Path,
    QuadraticBezierCurveCommand
} from "./path";

export class PathBuilder {
    readonly firstCommand: MoveCommand;
    private commands: Command[] = [];
    private openPathStack: MoveCommand[] = [];

    get lastCommand() {
        return this.commands[this.commands.length - 1];
    }

    get pathStart(): Point2D {
        return this.firstCommand.terminalPoint;
    }

    get currentPosition() {
        return this.lastCommand?.terminalPoint ?? Point2D.of(0, 0);
    }

    private constructor(initialPoint: Point2D | Vector2D) {
        if (initialPoint instanceof Vector2D)
            this.firstCommand = this.m(initialPoint);
        else
            this.firstCommand = this.m(initialPoint);
    }

    public static m(point: Point2D): PathBuilder;
    public static m(vector: Vector2D): PathBuilder;
    public static m(point: Point2D | Vector2D): PathBuilder {
        return new PathBuilder(point);
    }

    public append<T extends Command>(command: T): T {
        this.commands.push(command);
        return command;
    }

    public m(point: Point2D): MoveCommand;
    public m(vector: Vector2D): MoveCommand;
    public m(point: Point2D | Vector2D): MoveCommand {
        const moveCommand = new MoveCommand(
            this.currentPosition,
            // @ts-expect-error
            point
        );
        this.openPathStack.push(moveCommand);
        return this.append(moveCommand);
    }

    public l(point: Point2D): LineCommand;
    public l(vector: Vector2D): LineCommand;
    public l(point: Point2D | Vector2D): LineCommand {
        return this.append(new LineCommand(
            this.currentPosition,
            // @ts-expect-error
            point
        ));
    }

    public q(controlPoint: Point2D, endingPoint: Point2D): QuadraticBezierCurveCommand;
    public q(controlPointVector: Vector2D, endingPointVector: Vector2D): QuadraticBezierCurveCommand;
    public q(controlPoint: Point2D | Vector2D, endingPoint: Point2D | Vector2D): QuadraticBezierCurveCommand {
        return this.append(new QuadraticBezierCurveCommand(
            this.currentPosition,
            // @ts-expect-error
            controlPoint, endingPoint
        ));
    }

    public c(firstControlPoint: Point2D, secondControlPoint: Point2D, endingPoint: Point2D): CubicBezierCurveCommand;
    public c(firstControlPointVector: Vector2D, secondControlPointVector: Vector2D, endingPointVector: Vector2D): CubicBezierCurveCommand;
    public c(firstControlPoint: Point2D | Vector2D, secondControlPoint: Point2D | Vector2D, endingPoint: Point2D | Vector2D): CubicBezierCurveCommand {
        return this.append(new CubicBezierCurveCommand(
            this.currentPosition,
            // @ts-expect-error
            firstControlPoint, secondControlPoint, endingPoint
        ));
    }

    public a(xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: boolean, sweepFlag: boolean, endingPoint: Point2D): EllipticalArcWrapperCommand;
    public a(xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: boolean, sweepFlag: boolean, endingPointVector: Vector2D): EllipticalArcWrapperCommand;
    public a(xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: boolean, sweepFlag: boolean, endingPoint: Point2D | Vector2D): EllipticalArcWrapperCommand {
        return this.append(new EllipticalArcWrapperCommand(
            this.currentPosition, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag,
            // @ts-expect-error
            endingPoint
        ));
    }

    public circularArc(radius: number, startAngle: number, endAngle: number, rotation?: number): EllipticalArcCommand;
    public circularArc(circularArc: CircularArc): EllipticalArcCommand;
    public circularArc(...args:
                           [radius: number, startAngle: number, endAngle: number, rotation?: number] |
                           [arc: CircularArc]
    ): EllipticalArcCommand {
        const startingPoint = this.currentPosition;
        if (args.length === 1) {
            const arc = args[0];
            return this.append(new EllipticalArcCommand(
                startingPoint,
                arc.radius, arc.radius, arc.startAngle, arc.endAngle, arc.rotation
            ));
        }
        const radius = args[0];
        return this.append(new EllipticalArcCommand(
            startingPoint,
            radius, radius, args[1], args[2], args[3]
        ));
    }

    public ellipticalArc(semiMajorAxis: number, semiMinorAxis: number, startAngle: number, endAngle: number, ellipseTilt?: number): EllipticalArcCommand;
    public ellipticalArc(arc: EllipticalArc): EllipticalArcCommand;
    public ellipticalArc(
        ...args: [semiMajorAxis: number, semiMinorAxis: number,
            startAngle: number, endAngle: number,
            ellipseTilt?: number] | [arc: EllipticalArc]
    ): EllipticalArcCommand {
        return this.append(new EllipticalArcCommand(
            this.currentPosition,
            // @ts-expect-error
            ...args
        ));
    }

    public hermiteCurve(startVelocity: Vector2D, endVelocity: Vector2D, endingPoint: Point2D): CubicBezierHermiteCurveCommand;
    public hermiteCurve(startVelocity: Vector2D, endVelocity: Vector2D, endingPoint: Vector2D): CubicBezierHermiteCurveCommand;
    public hermiteCurve(startVelocity: Vector2D, endVelocity: Vector2D, endingPoint: Point2D | Vector2D): CubicBezierHermiteCurveCommand {
        return this.append(new CubicBezierHermiteCurveCommand(
            this.currentPosition, startVelocity, endVelocity,
            // @ts-expect-error
            endingPoint
        ));
    }

    public bezierCircularArc(radius: number, startAngle: number, endAngle: number, rotation?: number): CubicBezierEllipticalArc;
    public bezierCircularArc(circularArc: CircularArc): CubicBezierEllipticalArc;
    public bezierCircularArc(...args:
                                 [radius: number, startAngle: number, endAngle: number, rotation?: number] |
                                 [circularArc: CircularArc]
    ): CubicBezierEllipticalArc {
        const startingPoint = this.currentPosition;
        if (args.length === 1) {
            const arc = args[0];
            return this.append(new CubicBezierEllipticalArc(
                startingPoint,
                arc.radius, arc.radius, arc.startAngle, arc.endAngle, arc.rotation
            ));
        }
        const radius = args[0];
        return this.append(new CubicBezierEllipticalArc(
            startingPoint,
            radius, radius, args[1], args[2], args[3]
        ));
    }

    public bezierEllipticalArc(
        semiMajorAxis: number, semiMinorAxis: number,
        startAngle: number, endAngle: number,
        ellipseTilt?: number
    ): CubicBezierEllipticalArc;
    public bezierEllipticalArc(ellipticalArc: EllipticalArc): CubicBezierEllipticalArc;
    public bezierEllipticalArc(...args:
                                   [
                                       semiMajorAxis: number, semiMinorAxis: number,
                                       startAngle: number, endAngle: number,
                                       ellipseTilt?: number
                                   ] | [arc: EllipticalArc]
    ): CubicBezierEllipticalArc {
        return this.append(new CubicBezierEllipticalArc(
            this.currentPosition,
            // @ts-expect-error
            ...args
        ));
    }

    public chordScaledBezier(endingPoint: Point2D, startDirection: Vector2D, endDirection: Vector2D, startHandleScale?: number, endHandleScale?: number): ChordScaledBezierCommand;
    public chordScaledBezier(endingPointVector: Vector2D, startDirection: Vector2D, endDirection: Vector2D, startHandleScale?: number, endHandleScale?: number): ChordScaledBezierCommand;
    public chordScaledBezier(
        endingPoint: Point2D | Vector2D,
        startDirection: Vector2D, endDirection: Vector2D,
        startHandleScale: number = 1 / 3,
        endHandleScale: number = startHandleScale
    ): ChordScaledBezierCommand {
        return this.append(new ChordScaledBezierCommand(
            this.currentPosition,
            // @ts-expect-error
            endingPoint,
            startDirection, endDirection, startHandleScale, endHandleScale
        ));
    }

    public z(): ClosePathCommand {
        return this.append(new ClosePathCommand(this.currentPosition, this.openPathStack.pop()!));
    }

    public toPath() {
        return new Path(this.commands);
    }

    public toSVGPathString() {
        return this.toPath().toSVGPathString();
    }
}