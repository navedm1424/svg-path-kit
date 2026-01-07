import {Point2D} from "./point2D";
import {Vector2D} from "./vector2D";
import { CubicBezierCurve } from "./cubic-bezier-curve";
import {
    AbsoluteCubicBezierCurvePrimitive,
    AbsoluteEllipticalArcPrimitive,
    AbsoluteLinePrimitive,
    AbsoluteMovePrimitive,
    AbsoluteQuadraticBezierCurvePrimitive,
    SVGPath,
    PrimitiveCommand,
    AbsoluteClosePathPrimitive
} from "./svg-path";
import {EllipticalArc} from "./ellipse";
import {CircularArc} from "./circle";

export interface Command {
    readonly initialPoint: Point2D;
    readonly terminalPoint: Point2D;

    getStartVelocity(): Vector2D | undefined;
    getEndVelocity(): Vector2D | undefined;
    toSVGPathCommand(): PrimitiveCommand;
}

export class MoveCommand implements Command {
    readonly terminalPoint: Point2D;

    constructor(initialPoint: Point2D, terminalPoint: Point2D);
    constructor(initialPoint: Point2D, terminalPointVector: Vector2D);
    constructor(
        readonly initialPoint: Point2D,
        terminalPoint: Point2D | Vector2D
    ) {
        this.terminalPoint = terminalPoint instanceof Point2D ? terminalPoint :
            initialPoint.add(terminalPoint);
    }

    public getStartVelocity(): Vector2D {
        return Vector2D.from(this.initialPoint, this.terminalPoint).normalize();
    }
    public getEndVelocity(): Vector2D {
        return this.getStartVelocity();
    }
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteMovePrimitive(this.terminalPoint);
    }
}

class LineCommand implements Command {
    readonly terminalPoint: Point2D;

    constructor(initialPoint: Point2D, terminalPoint: Point2D);
    constructor(initialPoint: Point2D, terminalPointVector: Vector2D);
    constructor(
        readonly initialPoint: Point2D,
        terminalPoint: Point2D | Vector2D
    ) {
        this.terminalPoint = terminalPoint instanceof Point2D ? terminalPoint :
            initialPoint.add(terminalPoint);
    }

    public getStartVelocity(): Vector2D {
        return Vector2D.from(this.initialPoint, this.terminalPoint).normalize();
    }
    public getEndVelocity(): Vector2D {
        return this.getStartVelocity();
    }
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteLinePrimitive(this.terminalPoint);
    }
}

export class QuadraticBezierCurveCommand implements Command {
    readonly controlPoint: Point2D;
    readonly terminalPoint: Point2D;

    constructor(initialPoint: Point2D, controlPoint: Point2D, terminalPoint: Point2D);
    constructor(initialPoint: Point2D, controlPointVector: Vector2D, terminalPointVector: Vector2D);
    constructor(
        readonly initialPoint: Point2D,
        controlPoint: Point2D | Vector2D,
        terminalPoint: Point2D | Vector2D
    ) {
        this.controlPoint = controlPoint instanceof Point2D ? controlPoint :
            initialPoint.add(controlPoint);
        this.terminalPoint = terminalPoint instanceof Point2D ? terminalPoint :
            initialPoint.add(terminalPoint);
    }

    public getStartVelocity(): Vector2D {
        return Vector2D.from(this.initialPoint, this.controlPoint).scale(2);
    }
    public getEndVelocity(): Vector2D {
        return Vector2D.from(this.controlPoint, this.terminalPoint).scale(2);
    }
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteQuadraticBezierCurvePrimitive(this.controlPoint, this.terminalPoint);
    }
}

export class CubicBezierCurveCommand implements Command {
    readonly firstControlPoint: Point2D;
    readonly secondControlPoint: Point2D;
    readonly terminalPoint: Point2D;

    constructor(initialPoint: Point2D, firstControlPoint: Point2D, secondControlPoint: Point2D, terminalPoint: Point2D);
    constructor(initialPoint: Point2D, firstControlPointVector: Vector2D, secondControlPointVector: Vector2D, terminalPointVector: Vector2D);
    constructor(
        readonly initialPoint: Point2D,
        firstControlPoint: Point2D | Vector2D,
        secondControlPoint: Point2D | Vector2D,
        terminalPoint: Point2D | Vector2D
    ) {
        this.firstControlPoint = firstControlPoint instanceof Point2D ? firstControlPoint :
            initialPoint.add(firstControlPoint);
        this.secondControlPoint = secondControlPoint instanceof Point2D ? secondControlPoint :
            initialPoint.add(secondControlPoint);
        this.terminalPoint = terminalPoint instanceof Point2D ? terminalPoint :
            initialPoint.add(terminalPoint);
    }

    public getStartVelocity(): Vector2D {
        return Vector2D.from(this.initialPoint, this.firstControlPoint).scale(3);
    }
    public getEndVelocity(): Vector2D {
        return Vector2D.from(this.secondControlPoint, this.terminalPoint).scale(3);
    }
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteCubicBezierCurvePrimitive(this.firstControlPoint, this.secondControlPoint, this.terminalPoint);
    }
}

export class CubicBezierEllipticalArc implements Command {
    readonly arc: EllipticalArc;
    readonly cubicBezierCurve: CubicBezierCurve;

    constructor(initialPoint: Point2D, semiMajorAxis: number, semiMinorAxis: number, startAngle: number, endAngle: number, ellipseTilt?: number);
    constructor(initialPoint: Point2D, arc: EllipticalArc);
    constructor(
        readonly initialPoint: Point2D,
        ...args: [semiMajorAxis: number, semiMinorAxis: number,
        startAngle: number, endAngle: number,
        ellipseTilt?: number] | [arc: EllipticalArc]
    ) {
        let semiMajorAxis: number;
        let semiMinorAxis: number;
        let startAngle: number;
        let endAngle: number;
        let ellipseTilt: number | undefined;

        if (args.length === 1) {
            this.arc = args[0];
            startAngle = this.arc.startAngle;
            endAngle = this.arc.endAngle;
        } else {
            semiMajorAxis = args[0];
            semiMinorAxis = args[1];
            startAngle = args[2];
            endAngle = args[3];
            ellipseTilt = args[4];
            this.arc = new EllipticalArc(
                semiMajorAxis, semiMinorAxis,
                startAngle, endAngle,
                ellipseTilt
            );
        }
        const startVec = this.arc.startingPointVector;
        const center = initialPoint.add(startVec.opposite());
        const endingPoint = center.add(this.arc.endingPointVector);

        // derivative at (semiMajorAxis * cos(angle), semiMinorAxis * sin(angle)) = (-semiMajorAxis * sin(angle), semiMinorAxis * cos(angle))
        const startControlVector = this.arc.startingTangentVector;
        const endControlVector = this.arc.endingTangentVector;

        // scalar factor = 4 / 3 * tan((endAngle - startAngle) / 4))
        const factor = (4.0 / 3.0) * Math.tan((endAngle - startAngle) / 4);
        startControlVector.scale(factor);
        endControlVector.scale(-factor);

        this.cubicBezierCurve = new CubicBezierCurve(
            initialPoint, initialPoint.add(startControlVector),
            endingPoint.add(endControlVector), endingPoint
        );
    }

    get terminalPoint(): Point2D {
        return this.cubicBezierCurve.endingPoint;
    }
    getStartVelocity(): Vector2D {
        return Vector2D.from(this.initialPoint, this.cubicBezierCurve.firstControlPoint).scale(3);
    }
    getEndVelocity(): Vector2D {
        return Vector2D.from(this.cubicBezierCurve.secondControlPoint, this.cubicBezierCurve.endingPoint).scale(3);
    }
    toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteCubicBezierCurvePrimitive(
            this.cubicBezierCurve.firstControlPoint,
            this.cubicBezierCurve.secondControlPoint,
            this.cubicBezierCurve.endingPoint
        );
    }
}

export class CubicBezierHermiteCurveCommand implements Command {
    readonly terminalPoint: Point2D;

    constructor(initialPoint: Point2D, startVelocity: Vector2D, endVelocity: Vector2D, terminalPoint: Point2D);
    constructor(initialPoint: Point2D, startVelocity: Vector2D, endVelocity: Vector2D, terminalPoint: Vector2D);
    constructor(
        readonly initialPoint: Point2D,
        readonly startVelocity: Vector2D,
        readonly endVelocity: Vector2D,
        terminalPoint: Point2D | Vector2D
    ) {
        this.terminalPoint = terminalPoint instanceof Point2D ? terminalPoint :
            initialPoint.add(terminalPoint);
    }

    public getStartVelocity(): Vector2D {
        return this.startVelocity;
    }
    public getEndVelocity(): Vector2D {
        return this.endVelocity;
    }
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteCubicBezierCurvePrimitive(
            this.initialPoint.add(this.startVelocity.clone().scale(1 / 3)),
            this.terminalPoint.add(this.endVelocity.clone().scale(-1 / 3)),
            this.terminalPoint
        );
    }
}

export class EllipticalArcCommand implements Command {
    readonly terminalPoint: Point2D;

    constructor(initialPoint: Point2D, xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, endingPoint: Point2D);
    constructor(initialPoint: Point2D, xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, endingPointVector: Vector2D);
    constructor(
        readonly initialPoint: Point2D,
        readonly xRadius: number,
        readonly yRadius: number,
        readonly xAxisRotation: number,
        readonly largeArcFlag: 0 | 1,
        readonly sweepFlag: 0 | 1,
        endingPoint: Point2D | Vector2D
    ) {
        this.terminalPoint = endingPoint instanceof Point2D ? endingPoint :
            initialPoint.add(endingPoint);
    }

    // TODO: Write the actual implementation
    public getStartVelocity(): Vector2D | undefined {
        return undefined;
    }
    public getEndVelocity(): Vector2D | undefined {
        return undefined;
    }
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteEllipticalArcPrimitive(this.xRadius, this.yRadius, this.xAxisRotation, this.largeArcFlag, this.sweepFlag, this.terminalPoint);
    }
}

export class CubicBezierAutoControlCurveCommand implements Command {
    readonly terminalPoint: Point2D;
    readonly cubicBezierCurve: CubicBezierCurve;

    constructor(initialPoint: Point2D, terminalPoint: Point2D, startAngle?: number, endAngle?: number, startHandleScale?: number, endHandleScale?: number);
    constructor(initialPoint: Point2D, terminalPointVector: Vector2D, startAngle?: number, endAngle?: number, startHandleScale?: number, endHandleScale?: number);
    constructor(
        readonly initialPoint: Point2D,
        terminalPoint: Point2D | Vector2D,
        readonly startAngle?: number,
        readonly endAngle?: number,
        readonly startHandleScale: number = 1 / 3,
        readonly endHandleScale: number = startHandleScale
    ) {
        this.terminalPoint = terminalPoint instanceof Point2D ? terminalPoint :
            initialPoint.add(terminalPoint);
        const chord = Vector2D.from(initialPoint, this.terminalPoint);
        const chordLen = chord.magnitude;
        if (chordLen < 1e-9) {
            this.cubicBezierCurve = new CubicBezierCurve(
                initialPoint, initialPoint, initialPoint, initialPoint
            ); // degenerate
            return;
        }

        const startDirection: Vector2D | null = startAngle !== undefined ?
            Vector2D.of(Math.cos(startAngle), Math.sin(startAngle)) : null;
        const endDirection: Vector2D | null = endAngle !== undefined ?
            Vector2D.of(Math.cos(endAngle), Math.sin(endAngle)) : null;

        let firstControlPoint: Point2D;
        let secondControlPoint: Point2D;
        if (startDirection) {
            startDirection.scale(chordLen * startHandleScale);
            firstControlPoint = initialPoint.add(startDirection);
        } else {
            const chordClone = chord.clone();
            chordClone.scale(startHandleScale);
            firstControlPoint = initialPoint.add(chordClone);
        }

        if (endDirection) {
            endDirection.scale(chordLen * endHandleScale);
            secondControlPoint = this.terminalPoint.add(endDirection);
        } else {
            const chordClone = chord.opposite();
            chordClone.scale(endHandleScale);
            secondControlPoint = this.terminalPoint.add(chordClone);
        }
        this.cubicBezierCurve = new CubicBezierCurve(
            initialPoint, firstControlPoint,
            secondControlPoint, this.terminalPoint
        )
    }

    public getStartVelocity(): Vector2D {
        return Vector2D.from(this.initialPoint, this.cubicBezierCurve.firstControlPoint).scale(3);
    }
    public getEndVelocity(): Vector2D {
        return Vector2D.from(this.cubicBezierCurve.secondControlPoint, this.terminalPoint).scale(3);
    }
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteCubicBezierCurvePrimitive(
            this.cubicBezierCurve.firstControlPoint, this.cubicBezierCurve.secondControlPoint, this.terminalPoint
        );
    }
}

export class ClosePathCommand implements Command {
    constructor(
        readonly initialPoint: Point2D,
        readonly moveCommand: MoveCommand
    ) { }

    get terminalPoint(): Point2D {
        return this.moveCommand.terminalPoint;
    }
    public getStartVelocity(): Vector2D {
        return Vector2D.from(this.initialPoint, this.moveCommand.terminalPoint);
    }
    public getEndVelocity(): Vector2D {
        return this.getStartVelocity();
    }
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteClosePathPrimitive();
    }
}

export class PathBuilder {
    readonly firstCommand: MoveCommand;
    private commands: Command[] = [];
    private openPathStack: MoveCommand[] = [];

    get lastCommand() {
        return this.commands.length === 0 ?
            null : this.commands[this.commands.length - 1];
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

    public q(controlPoint: Point2D, endPoint: Point2D): QuadraticBezierCurveCommand;
    public q(controlPoint: Vector2D, endPoint: Vector2D): QuadraticBezierCurveCommand;
    public q(controlPoint: Point2D | Vector2D, endPoint: Point2D | Vector2D): QuadraticBezierCurveCommand {
        return this.append(new QuadraticBezierCurveCommand(
            this.currentPosition,
            // @ts-expect-error
            controlPoint, endPoint
        ));
    }

    public c(firstControlPoint: Point2D, secondControlPoint: Point2D, endingPoint: Point2D): CubicBezierCurveCommand;
    public c(firstControlPoint: Vector2D, secondControlPoint: Vector2D, endingPoint: Vector2D): CubicBezierCurveCommand;
    public c(firstControlPoint: Point2D | Vector2D, secondControlPoint: Point2D | Vector2D, endingPoint: Point2D | Vector2D): CubicBezierCurveCommand {
        return this.append(new CubicBezierCurveCommand(
            this.currentPosition,
            // @ts-expect-error
            firstControlPoint, secondControlPoint, endingPoint
        ));
    }

    public a(xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, endPoint: Point2D): EllipticalArcCommand;
    public a(xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, endPoint: Vector2D): EllipticalArcCommand;
    public a(xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, endPoint: Point2D | Vector2D): EllipticalArcCommand {
        return this.append(new EllipticalArcCommand(
            this.currentPosition, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag,
            // @ts-expect-error
            endPoint
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

    public circularArc(radius: number, startAngle: number, endAngle: number, rotation?: number): CubicBezierEllipticalArc;
    public circularArc(circularArc: CircularArc): CubicBezierEllipticalArc;
    public circularArc(...args:
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

    public ellipticalArc(
        semiMajorAxis: number, semiMinorAxis: number,
        startAngle: number, endAngle: number,
        ellipseTilt?: number
    ): CubicBezierEllipticalArc;
    public ellipticalArc(ellipticalArc: EllipticalArc): CubicBezierEllipticalArc;
    public ellipticalArc(...args:
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

    public cAutoControl(endingPoint: Point2D, startAngle?: number, endAngle?: number, startHandleScale?: number, endHandleScale?: number): CubicBezierAutoControlCurveCommand;
    public cAutoControl(endingPointVector: Vector2D, startAngle?: number, endAngle?: number, startHandleScale?: number, endHandleScale?: number): CubicBezierAutoControlCurveCommand;
    public cAutoControl(
        endingPoint: Point2D | Vector2D,
        startAngle?: number, endAngle?: number,
        startHandleScale: number = 1 / 3,
        endHandleScale: number = startHandleScale
    ): CubicBezierAutoControlCurveCommand {
        return this.append(new CubicBezierAutoControlCurveCommand(
            this.currentPosition,
            // @ts-expect-error
            endingPoint,
            startAngle, endAngle, startHandleScale, endHandleScale
        ));
    }

    public z(): ClosePathCommand {
        return this.append(new ClosePathCommand(this.currentPosition, this.openPathStack.pop()!));
    }

    public toPath() {
        return new SVGPath(this.commands.map(c => c.toSVGPathCommand()));
    }

    public toString() {
        return this.toPath().toString();
    }
}