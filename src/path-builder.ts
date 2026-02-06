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
import {Angle} from "./angle";

/**
 * Builder class for constructing SVG paths from geometric utilities.
 */
export class PathBuilder {
    readonly firstCommand: MoveCommand;
    #commands: Command[] = [];
    #commandsById: Record<string, Command> = {};
    #openPathStack: MoveCommand[] = [];

    /** Most recently appended command. */
    get lastCommand() {
        return this.#commands[this.#commands.length - 1];
    }

    /** Starting point of the path. */
    get pathStart(): Point2D {
        return this.firstCommand.terminalPoint;
    }

    /** Current drawing cursor position (endpoint of the last command). */
    get currentPosition() {
        return this.lastCommand?.terminalPoint ?? Point2D.ORIGIN;
    }

    /** Velocity at the current position (derived from the last command). */
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

        Object.defineProperty(this, "firstCommand", {
            value: this.firstCommand,
            writable: false,
            configurable: false
        });
    }

    /**
     * Create a builder starting at a given point or offset vector (equivalent).
     */
    public static m(point: Point2D): PathBuilder;
    public static m(vector: Vector2D): PathBuilder;
    public static m(point: Point2D | Vector2D): PathBuilder {
        return new PathBuilder(point);
    }

    /**
     * Append a command to the builder.
     */
    public append<T extends Command>(command: T): T {
        this.#commands.push(command);
        return command;
    }

    public setLastCommandId(id: string): void {
        this.#commandsById[id] = this.lastCommand;
    }

    public getCommandById(id: string): Command | null {
        return this.#commandsById[id] ?? null;
    }

    /**
     * Start a new subpath with a move command.
     */
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

    /**
     * Draw a line from the current position to a given point specified explicitly or by an offset vector.
     */
    public l(point: Point2D): LineCommand;
    public l(vector: Vector2D): LineCommand;
    public l(point: Point2D | Vector2D): LineCommand {
        return this.append(new LineCommand(
            this.currentPosition,
            // @ts-expect-error
            point
        ));
    }

    /**
     * Draw a quadratic Bézier curve.
     */
    public q(controlPoint: Point2D, endingPoint: Point2D): QuadraticBezierCurveCommand;
    public q(controlPointVector: Vector2D, endingPointVector: Vector2D): QuadraticBezierCurveCommand;
    public q(controlPoint: Point2D | Vector2D, endingPoint: Point2D | Vector2D): QuadraticBezierCurveCommand {
        return this.append(new QuadraticBezierCurveCommand(
            this.currentPosition,
            // @ts-expect-error
            controlPoint, endingPoint
        ));
    }

    /**
     * Draw a cubic Bézier curve.
     */
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
     * Draw a primitive-style elliptical arc by radii and flags.
     *
     * > `xAxisRotation` is entered in radians to stay in concert with the rest of the API. This is contrary to what the primitive elliptical arc (`A`) command expects—angle in degrees.
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
     * This command lets you draw circular arcs with SVG path elliptical arc (A) commands without having to deal with all the confusing flags.
     * You just have to provide the radius and parametric angle bounds or a {@link CircularArc} object.
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
     * This command lets you draw elliptical arcs with SVG path elliptical arc (A) commands without having to deal with all the confusing flags.
     * You just have to specify the semi-axes and parametric angles or provide an {@link EllipticalArc} object.
     *
     * > Keep in mind that `startAngle` and `endAngle` are not central angles; they are parametric angles. The central angle of a point on an ellipse is the angle the vector from the center to that point makes with the horizontal semi-axis. This is not the same as the parametric angle of the point, which is what goes into the parametric equations of an ellipse: x(θ) = a cos(θ) and y(θ) = b sin(θ).
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
     * Draw a cubic Hermite curve parameterized by endpoint velocities.
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
     * This command gives you the closest cubic Bézier approximation of a circular arc parameterized by the radius and angle bounds.
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
     * This command gives you the closest cubic Bézier approximation of an elliptical arc parameterized by the semi-axes and angular parameters.
     *
     * > Keep in mind that `startAngle` and `endAngle` are not central angles; they are parametric angles. The central angle of a point on an ellipse is the angle the vector from the center to that point makes with the horizontal semi-axis. This is not the same as the parametric angle of the point, which is what goes into the parametric equations of an ellipse: x(θ) = a cos(θ) and y(θ) = b sin(θ).
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
     * This command lets you scale cubic Bézier handles relative to the chord length and direct them by angles.
     *
     * - `startHandleAngle` is the angle that the first handle vector is intended to make with the x-axis.
     * - `endHandleAngle` is the angle that the second handle vector is intended to make with the x-axis.
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

    /**
     * Close the current subpath.
     */
    public z(): ClosePathCommand {
        return this.append(new ClosePathCommand(this.currentPosition, this.#openPathStack.pop()!));
    }

    public toPath() {
        return new Path(Object.freeze(this.#commands));
    }

    /** Serialize the built path to an SVG path string. */
    public toSVGPathString() {
        return this.toPath().toSVGPathString();
    }
}