import { cubicBezierAutoControl, cubicBezierCurveForCircularArc, cubicBezierCurveForEllipticalArc } from "./cubic-bezier-curve";
import { round } from "../utils/math";
import { Vector2D } from "./vector2D";
import {Point2D} from "./point2D";

export abstract class Command {
    constructor(readonly mode: 'relative' | 'absolute' = 'relative') {}

    protected coordinates(point: Point2D | Vector2D) {
        return `${round(point.x, 4)} ${round(point.y, 4)}`;
    }

    public abstract toString(): string;
    public abstract getEndPoint(): Point2D;
};

export class MoveCommand extends Command {
    constructor(readonly startingPoint: Point2D, readonly endPoint: Vector2D, mode: 'relative' | 'absolute' = 'relative') {
        super(mode);
    }

    public toString() {
        const cmd = this.mode === 'relative' ? 'm' : 'M';
        const point = this.mode === 'relative' ? this.endPoint : this.startingPoint.add(this.endPoint);
        return `${cmd} ${this.coordinates(point)}`;
    }

    public getEndPoint(): Point2D {
        return this.startingPoint.add(this.endPoint);
    }
};

export class LineCommand extends Command {
    constructor(readonly startingPoint: Point2D, readonly endPoint: Vector2D, mode: 'relative' | 'absolute' = 'relative') {
        super(mode);
    }

    public toString() {
        const cmd = this.mode === 'relative' ? 'l' : 'L';
        const end = this.mode === 'relative' ? this.endPoint : this.startingPoint.add(this.endPoint);
        return `${cmd} ${this.coordinates(end)}`;
    }

    public getEndPoint(): Point2D {
        return this.startingPoint.add(this.endPoint);
    }
};

export class QuadraticBezierCurveCommand extends Command {
    constructor(
        readonly startingPoint: Point2D,
        readonly controlPoint: Vector2D,
        readonly endPoint: Vector2D,
        mode: 'relative' | 'absolute' = 'relative'
    ) {
        super(mode);
    }

    public toString() {
        const cmd = this.mode === 'relative' ? 'q' : 'Q';
        const cp = this.mode === 'relative' ? this.controlPoint : this.startingPoint.add(this.controlPoint);
        const ep = this.mode === 'relative' ? this.endPoint : this.startingPoint.add(this.endPoint);
        return `${cmd} ${this.coordinates(cp)} ${this.coordinates(ep)}`;
    }

    public getEndPoint(): Point2D {
        return this.startingPoint.add(this.endPoint);
    }
};

export class CubicBezierCurveCommand extends Command {
    constructor(
        readonly startingPoint: Point2D,
        readonly firstControlPoint: Vector2D,
        readonly secondControlPoint: Vector2D,
        readonly endPoint: Vector2D,
        mode: 'relative' | 'absolute' = 'relative'
    ) {
        super(mode);
    }

    public toString() {
        const cmd = this.mode === 'relative' ? 'c' : 'C';
        const cp1 = this.mode === 'relative' ? this.firstControlPoint : this.startingPoint.add(this.firstControlPoint);
        const cp2 = this.mode === 'relative' ? this.secondControlPoint : this.startingPoint.add(this.secondControlPoint);
        const ep = this.mode === 'relative' ? this.endPoint : this.startingPoint.add(this.endPoint);
        return `${cmd} ${this.coordinates(cp1)} ${this.coordinates(cp2)} ${this.coordinates(ep)}`;
    }

    public getEndPoint(): Point2D {
        return this.startingPoint.add(this.endPoint);
    }
};

export class EllipticalArcCommand extends Command {
    constructor(
        readonly startingPoint: Point2D,
        readonly xRadius: number,
        readonly yRadius: number,
        readonly xAxisRotation: number,
        readonly largeArcFlag: 0 | 1,
        readonly sweepFlag: 0 | 1,
        readonly endPoint: Vector2D,
        mode: 'relative' | 'absolute' = 'relative'
    ) {
        super(mode);
    }

    public toString() {
        const cmd = this.mode === 'relative' ? 'a' : 'A';
        const ep = this.mode === 'relative' ? this.endPoint : this.startingPoint.add(this.endPoint);
        return `${cmd} ${this.xRadius} ${this.yRadius} ${this.xAxisRotation} ${this.largeArcFlag} ${this.sweepFlag} ${this.coordinates(ep)}`;
    }

    public getEndPoint(): Point2D {
        return this.startingPoint.add(this.endPoint);
    }
};

export class ClosePathCommand extends Command {
    constructor(
        readonly pathStart: MoveCommand,
        mode: 'relative' | 'absolute' = 'relative'
    ) {
        super(mode);
    }

    public toString() {
        return `z`;
    }

    public getEndPoint(): Point2D {
        return this.pathStart.startingPoint;
    }
};

export class Path {
    constructor(readonly commands: Command[]) { }

    public toString() {
        return this.commands.map(c => c.toString()).join(' ');
    }
};

export class PathBuilder {
    private commands: Command[] = [];
    private openPathStack: MoveCommand[] = [];

    get currentPosition() {
        return this.lastCommand?.getEndPoint() ?? Point2D.of(0, 0);
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
        const moveCommand = new MoveCommand(startingPoint, point, 'relative');
        this.commands.push(moveCommand);
        this.openPathStack.push(moveCommand);
        return this;
    }

    // Absolute move
    public M(point: Point2D) {
        const startingPoint = this.currentPosition;
        const endPointVector = Vector2D.from(startingPoint, point);
        const moveCommand = new MoveCommand(startingPoint, endPointVector, 'absolute');
        this.commands.push(moveCommand);
        this.openPathStack.push(moveCommand);
        return this;
    }

    // Relative line
    public l(point: Vector2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(new LineCommand(startingPoint, point, 'relative'));
        return this;
    }

    // Absolute line
    public L(point: Point2D) {
        const startingPoint = this.currentPosition;
        const endPointVector = Vector2D.from(startingPoint, point);
        this.commands.push(new LineCommand(startingPoint, endPointVector, 'absolute'));
        return this;
    }

    // Relative quadratic Bézier curve
    public q(controlPoint: Vector2D, endPoint: Vector2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(new QuadraticBezierCurveCommand(startingPoint, controlPoint, endPoint, 'relative'));
        return this;
    }

    // Absolute quadratic Bézier curve
    public Q(controlPoint: Point2D, endPoint: Point2D) {
        const startingPoint = this.currentPosition;
        const controlPointVector = Vector2D.from(startingPoint, controlPoint);
        const endPointVector = Vector2D.from(startingPoint, endPoint);
        this.commands.push(new QuadraticBezierCurveCommand(startingPoint, controlPointVector, endPointVector, 'absolute'));
        return this;
    }

    // Relative cubic Bézier curve
    public c(firstControlPoint: Vector2D, secondControlPoint: Vector2D, endPoint: Vector2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPoint, secondControlPoint, endPoint, 'relative'));
        return this;
    }

    // Absolute cubic Bézier curve
    public C(firstControlPoint: Point2D, secondControlPoint: Point2D, endPoint: Point2D) {
        const startingPoint = this.currentPosition;
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endPoint);
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPointVector, secondControlPointVector, endPointVector, 'absolute'));
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
        this.commands.push(new EllipticalArcCommand(startingPoint, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint, 'relative'));
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
        const endPointVector = Vector2D.from(startingPoint, endPoint);
        this.commands.push(new EllipticalArcCommand(startingPoint, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPointVector, 'absolute'));
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
        if (typeof args[0] === "number" && args[1] instanceof Vector2D) {
            const absoluteEndPoint = startingPoint.add(args[1]);
            cubicBezierCurve = cubicBezierCurveForCircularArc(startingPoint, args[0], absoluteEndPoint);
        } else if (args[0] instanceof Vector2D && typeof args[1] === "number") {
            const absoluteCenter = startingPoint.add(args[0]);
            cubicBezierCurve = cubicBezierCurveForCircularArc(absoluteCenter, startingPoint, args[1]);
        } else {
            throw new Error("Invalid Arguments");
        }

        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endingPoint);
        this.commands.push(new CubicBezierCurveCommand(
            startingPoint,
            firstControlPointVector,
            secondControlPointVector,
            endPointVector,
            'relative'
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
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endingPoint);
        this.commands.push(new CubicBezierCurveCommand(
            startingPoint,
            firstControlPointVector,
            secondControlPointVector,
            endPointVector,
            'absolute'
        ));
        return this;
    }

    public cForEllipticalArc(
        center: Vector2D, angle: number, axisRatio: number, ellipseRotation: number = 0
    ) {
        const startingPoint = this.currentPosition;
        const absoluteCenter = startingPoint.add(center);
        const cubicBezierCurve = cubicBezierCurveForEllipticalArc(absoluteCenter, startingPoint, angle, axisRatio, ellipseRotation);
        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endingPoint);
        this.commands.push(new CubicBezierCurveCommand(
            startingPoint,
            firstControlPointVector,
            secondControlPointVector,
            endPointVector,
            'relative'
        ));
        return this;
    }

    public CForEllipticalArc(
        center: Point2D, angle: number, axisRatio: number, ellipseRotation: number = 0
    ) {
        const startingPoint = this.currentPosition;
        const cubicBezierCurve = cubicBezierCurveForEllipticalArc(center, startingPoint, angle, axisRatio, ellipseRotation);
        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endingPoint);
        this.commands.push(new CubicBezierCurveCommand(
            startingPoint,
            firstControlPointVector,
            secondControlPointVector,
            endPointVector,
            'absolute'
        ));
        return this;
    }

    // Relative smooth cubic Bézier curve (with optional angles and curvatures)
    public cAutoControl(
        endingPoint: Vector2D,
        startAngle?: number, endAngle?: number,
        curvatureA: number = 1 / 3,
        curvatureB: number = curvatureA
    ) {
        const startingPoint = this.currentPosition;
        const absoluteEndPoint = startingPoint.add(endingPoint);

        let startDirection: Vector2D | null = null;
        if (startAngle !== undefined) {
            startDirection = Vector2D.of(Math.cos(startAngle), Math.sin(startAngle))
        } else {
            const lastCommand = this.lastCommand;
            if (lastCommand instanceof LineCommand) {
                startDirection = lastCommand.endPoint.unit();
            } else if (lastCommand instanceof CubicBezierCurveCommand) {
                const directionVector = lastCommand.endPoint.subtract(lastCommand.secondControlPoint);
                startDirection = directionVector.unit();
            } else if (lastCommand instanceof QuadraticBezierCurveCommand) {
                const directionVector = lastCommand.endPoint.subtract(lastCommand.controlPoint);
                startDirection = directionVector.unit();
            }
        }
        let endDirection: Vector2D | null = null;
        if (endAngle !== undefined) {
            endDirection = Vector2D.of(Math.cos(endAngle), Math.sin(endAngle));
        }
        const { firstControlPoint, secondControlPoint } = cubicBezierAutoControl(
            startingPoint, absoluteEndPoint,
            startDirection ?? undefined, endDirection ?? undefined,
            curvatureA, curvatureB
        );
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, absoluteEndPoint);
        this.commands.push(new CubicBezierCurveCommand(
            startingPoint,
            firstControlPointVector,
            secondControlPointVector,
            endPointVector,
            'relative'
        ));
        return this;
    }

    public CAutoControl(
        endingPoint: Point2D,
        startAngle?: number, endAngle?: number,
        curvatureA: number = 1 / 3,
        curvatureB: number = curvatureA
    ) {
        const startingPoint = this.currentPosition;

        let startDirection: Vector2D | null = null;
        if (startAngle !== undefined) {
            startDirection = Vector2D.of(Math.cos(startAngle), Math.sin(startAngle))
        } else {
            const lastCommand = this.lastCommand;
            if (lastCommand instanceof LineCommand) {
                startDirection = lastCommand.endPoint.unit();
            } else if (lastCommand instanceof CubicBezierCurveCommand) {
                const directionVector = lastCommand.endPoint.subtract(lastCommand.secondControlPoint);
                startDirection = directionVector.unit();
            } else if (lastCommand instanceof QuadraticBezierCurveCommand) {
                const directionVector = lastCommand.endPoint.subtract(lastCommand.controlPoint);
                startDirection = directionVector.unit();
            }
        }
        let endDirection: Vector2D | null = null;
        if (endAngle !== undefined) {
            endDirection = Vector2D.of(Math.cos(endAngle), Math.sin(endAngle));
        }
        const { firstControlPoint, secondControlPoint } = cubicBezierAutoControl(
            startingPoint, endingPoint,
            startDirection ?? undefined, endDirection ?? undefined,
            curvatureA, curvatureB
        );
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endingPoint);
        this.commands.push(new CubicBezierCurveCommand(
            startingPoint,
            firstControlPointVector,
            secondControlPointVector,
            endPointVector,
            'absolute'
        ));
        return this;
    }

    public z() {
        this.commands.push(new ClosePathCommand(this.openPathStack.pop()!, 'relative'));
        return this;
    }

    public toPath() {
        return new Path(this.commands);
    }

    public toString() {
        return this.toPath().toString();
    }
};
