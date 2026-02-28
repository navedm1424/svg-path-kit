import {Point2D} from "./point2D.js";
import {Vector2D} from "./vector2D.js";
import {CircularArc, EllipticalArc} from "./curves/index.js";
import {
    type Command,
    ChordScaledBezierCommand,
    ClosePathCommand,
    CubicBezierCurveCommand,
    CubicBezierEllipticalArc,
    CubicBezierHermiteCurveCommand,
    EllipticalArcCommand,
    EllipticalArcWrapperCommand,
    LineCommand,
    MoveCommand, Path,
    QuadraticBezierCurveCommand, HandleDefinedCubicBezierCurve
} from "./path.js";
import {Angle} from "./angle.js";
import {makePropertiesReadonly} from "./utils/object-utils.runtime.js";

/**
 * Builder class for constructing SVG paths from geometric utilities
 */
export class PathBuilder {
    readonly firstCommand: MoveCommand;
    #commands: Command[] = [];
    #openPathStack: MoveCommand[] = [];

    /** Most recently appended command */
    get lastCommand() {
        if (this.#commands.length === 0)
            throw new Error("Invalid state: PathBuilder initialized without commands.");

        return this.#commands[this.#commands.length - 1]!;
    }

    /** Starting point of the path */
    get pathStart(): Point2D {
        return this.firstCommand.terminalPoint;
    }

    /** Current drawing cursor position (endpoint of the last command) */
    get currentPosition() {
        try {
            return this.lastCommand.terminalPoint;
        } catch (e) {
            return Point2D.ORIGIN;
        }
    }

    /** Velocity at the current position (derived from the last command) */
    get currentVelocity() {
        return this.lastCommand.getEndVelocity();
    }

    private constructor(initialPoint: any) {
        if (!(initialPoint instanceof Point2D || initialPoint instanceof Vector2D))
            throw new Error("Invalid argument type.");

        if (initialPoint instanceof Vector2D)
            this.firstCommand = this.m(initialPoint);
        else
            this.firstCommand = this.m(initialPoint);

        makePropertiesReadonly(this, "firstCommand");
    }

    /** Create a builder starting at a given point or offset vector (equivalent) */
    public static m(point: Point2D): PathBuilder;
    public static m(vector: Vector2D): PathBuilder;
    public static m(point: Point2D | Vector2D): PathBuilder {
        return new PathBuilder(point);
    }

    /** Append a command to the builder. */
    public append<T extends Command>(command: T): T {
        this.#commands.push(command);
        return command;
    }

    /** Start a new subpath with a move command. */
    public m(point: Point2D): MoveCommand;
    public m(vector: Vector2D): MoveCommand;
    public m(point: Point2D | Vector2D): MoveCommand {
        const moveCommand = new MoveCommand(
            this.currentPosition,
            // @ts-expect-error
            point
        );
        this.#openPathStack.push(moveCommand);
        return this.append(moveCommand);
    }

    /** Line command (`L`/`l`) */
    public l(point: Point2D): LineCommand;
    public l(vector: Vector2D): LineCommand;
    public l(point: Point2D | Vector2D): LineCommand {
        return this.append(new LineCommand(
            this.currentPosition,
            // @ts-expect-error
            point
        ));
    }

    /** Quadratic Bézier curve command (`Q`/`q`) */
    public q(controlPoint: Point2D, endingPoint: Point2D): QuadraticBezierCurveCommand;
    public q(controlPointVector: Vector2D, endingPointVector: Vector2D): QuadraticBezierCurveCommand;
    public q(controlPoint: Point2D | Vector2D, endingPoint: Point2D | Vector2D): QuadraticBezierCurveCommand {
        return this.append(new QuadraticBezierCurveCommand(
            this.currentPosition,
            // @ts-expect-error
            controlPoint, endingPoint
        ));
    }

    /** Cubic Bézier curve command (`C`/`c`) */
    public c(firstControlPoint: Point2D, secondControlPoint: Point2D, endingPoint: Point2D): CubicBezierCurveCommand;
    public c(firstControlPointVector: Vector2D, secondControlPointVector: Vector2D, endingPointVector: Vector2D): CubicBezierCurveCommand;
    public c(firstControlPoint: Point2D | Vector2D, secondControlPoint: Point2D | Vector2D, endingPoint: Point2D | Vector2D): CubicBezierCurveCommand {
        return this.append(new CubicBezierCurveCommand(
            this.currentPosition,
            // @ts-expect-error
            firstControlPoint, secondControlPoint, endingPoint
        ));
    }

    /**
     * Elliptical arc command (`A`/`a`)
     *
     * > `xAxisRotation` is entered in radians to stay in concert with the rest of the API. This is contrary to what the primitive elliptical arc command expects—angle in degrees.
     */
    public a(xRadius: number, yRadius: number, xAxisRotation: number | Angle, largeArcFlag: boolean, sweepFlag: boolean, endingPoint: Point2D): EllipticalArcWrapperCommand;
    public a(xRadius: number, yRadius: number, xAxisRotation: number | Angle, largeArcFlag: boolean, sweepFlag: boolean, endingPointVector: Vector2D): EllipticalArcWrapperCommand;
    public a(xRadius: number, yRadius: number, xAxisRotation: number | Angle, largeArcFlag: boolean, sweepFlag: boolean, endingPoint: Point2D | Vector2D): EllipticalArcWrapperCommand {
        return this.append(new EllipticalArcWrapperCommand(
            this.currentPosition, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag,
            // @ts-expect-error
            endingPoint
        ));
    }

    /**
     * - Lets you draw circular arcs
     * - Uses the elliptical arc (`A`/`a`) command under the hood
     * - Spares you from its confusing flags
     */
    public circularArc(radius: number, startAngle: number | Angle, endAngle: number | Angle, rotation?: number | Angle): EllipticalArcCommand;
    public circularArc(circularArc: CircularArc): EllipticalArcCommand;
    public circularArc(...args:
        [radius: number, startAngle: number | Angle, endAngle: number | Angle, rotation?: number | Angle] |
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

    /**
     * - Lets you draw elliptical arcs
     * - Uses the `A`/`a` command under the hood
     * - Spares you from its confusing flags
     */
    public ellipticalArc(semiMajorAxis: number, semiMinorAxis: number, startAngle: number | Angle, endAngle: number | Angle, ellipseTilt?: number | Angle): EllipticalArcCommand;
    public ellipticalArc(arc: EllipticalArc): EllipticalArcCommand;
    public ellipticalArc(
        ...args: [semiMajorAxis: number, semiMinorAxis: number,
            startAngle: number | Angle, endAngle: number | Angle,
            ellipseTilt?: number | Angle] | [arc: EllipticalArc]
    ): EllipticalArcCommand {
        return this.append(new EllipticalArcCommand(
            this.currentPosition,
            // @ts-expect-error
            ...args
        ));
    }

    /**
     * - Lets you draw a cubic Hermite curve—curve that interpolates between velocities.
     * - Uses the `C`/`c` command under the hood
     */
    public hermiteCurve(startVelocity: Vector2D, endVelocity: Vector2D, endingPoint: Point2D): CubicBezierHermiteCurveCommand;
    public hermiteCurve(startVelocity: Vector2D, endVelocity: Vector2D, endingPoint: Vector2D): CubicBezierHermiteCurveCommand;
    public hermiteCurve(startVelocity: Vector2D, endVelocity: Vector2D, endingPoint: Point2D | Vector2D): CubicBezierHermiteCurveCommand {
        return this.append(new CubicBezierHermiteCurveCommand(
            this.currentPosition, startVelocity, endVelocity,
            // @ts-expect-error
            endingPoint
        ));
    }

    /**
     * - Gives you the closest cubic Bézier approximation of a circular arc
     * - Spares you from having to calculate the raw coordinates
     */
    public bezierCircularArc(radius: number, startAngle: number | Angle, endAngle: number | Angle, rotation?: number | Angle): CubicBezierEllipticalArc;
    public bezierCircularArc(circularArc: CircularArc): CubicBezierEllipticalArc;
    public bezierCircularArc(...args:
        [radius: number, startAngle: number | Angle, endAngle: number | Angle, rotation?: number | Angle] |
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

    /**
     * - Gives you the closest cubic Bézier approximation of an elliptical arc
     * - Spares you from having to calculate the raw coordinates
     */
    public bezierEllipticalArc(
        semiMajorAxis: number, semiMinorAxis: number,
        startAngle: number | Angle, endAngle: number | Angle,
        ellipseTilt?: number | Angle
    ): CubicBezierEllipticalArc;
    public bezierEllipticalArc(ellipticalArc: EllipticalArc): CubicBezierEllipticalArc;
    public bezierEllipticalArc(...args:
        [
            semiMajorAxis: number, semiMinorAxis: number,
            startAngle: number | Angle, endAngle: number | Angle,
            ellipseTilt?: number | Angle
        ] | [arc: EllipticalArc]
    ): CubicBezierEllipticalArc {
        return this.append(new CubicBezierEllipticalArc(
            this.currentPosition,
            // @ts-expect-error
            ...args
        ));
    }

    /**
     * Lets you specify the handle vectors:
     * - `start -> first control point`
     * - `end -> second control point`
     *
     * rather than the offset vectors of the control points.
     * */
    public handleDefinedBezier(firstHandleVector: Vector2D, secondHandleVector: Vector2D, endingPoint: Point2D): HandleDefinedCubicBezierCurve;
    public handleDefinedBezier(firstHandleVector: Vector2D, secondHandleVector: Vector2D, endingPointVector: Vector2D): HandleDefinedCubicBezierCurve;
    public handleDefinedBezier(
        firstHandleVector: Vector2D,
        secondHandleVector: Vector2D,
        endingPoint: Point2D | Vector2D
    ) {
        return this.append(new HandleDefinedCubicBezierCurve(
            this.currentPosition,
            firstHandleVector, secondHandleVector,
            // @ts-expect-error
            endingPoint
        ));
    }

    /**
     * This command lets you scale cubic Bézier handles relative to the chord length and direct them by angles.
     *
     * - `startHandleAngle` is the angle that the first handle vector should make with the x-axis.
     * - `endHandleAngle` is the angle that the second handle vector should make with the x-axis.
     * - `startHandleScale` is the ratio of the first handle's length to the chord length.
     * - `endHandleScale` is the ratio of the second handle's length to the chord length.
     */
    public chordScaledBezier(endingPoint: Point2D, startHandleAngle: number | Angle, endHandleAngle: number | Angle, startHandleScale?: number, endHandleScale?: number): ChordScaledBezierCommand;
    public chordScaledBezier(endingPointVector: Vector2D, startHandleAngle: number | Angle, endHandleAngle: number | Angle, startHandleScale?: number, endHandleScale?: number): ChordScaledBezierCommand;
    public chordScaledBezier(
        endingPoint: Point2D | Vector2D,
        startHandleAngle: number | Angle, endHandleAngle: number | Angle,
        startHandleScale: number = 1 / 3,
        endHandleScale: number = startHandleScale
    ): ChordScaledBezierCommand {
        return this.append(new ChordScaledBezierCommand(
            this.currentPosition,
            // @ts-expect-error
            endingPoint,
            startHandleAngle, endHandleAngle, startHandleScale, endHandleScale
        ));
    }

    /** Close the current subpath */
    public z(): ClosePathCommand {
        return this.append(new ClosePathCommand(this.currentPosition, this.#openPathStack.pop()!));
    }

    public toPath() {
        return new Path(this.#commands);
    }

    public toSVGPathString() {
        return this.toPath().toSVGPathString();
    }
}