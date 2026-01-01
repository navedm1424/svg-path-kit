import {Point2D} from "./point2D";
import {Vector2D} from "./vector2D";
import {
    cubicBezierAutoControl,
    CubicBezierCurve
} from "./cubic-bezier-curve";
import {
    AbsoluteCubicBezierCurveCommand,
    AbsoluteEllipticalArcCommand,
    AbsoluteLineCommand,
    AbsoluteMoveCommand,
    AbsoluteQuadraticBezierCurveCommand,
    RelativeClosePathCommand,
    RelativeCubicBezierCurveCommand,
    RelativeEllipticalArcCommand,
    RelativeLineCommand,
    RelativeMoveCommand,
    RelativeQuadraticBezierCurveCommand,
    SVGPath,
    SVGPathCommand
} from "./svg-path";
import {EllipticalArc} from "./ellipse";
import {CircularArc} from "./circle";

enum CommandMode {
    RELATIVE='relative',
    ABSOLUTE='absolute'
}

export interface Command {
    readonly startingPoint: Point2D;
    getEndingPoint(): Point2D;
    getStartDirection(): Vector2D | undefined;
    getEndDirection(): Vector2D | undefined;
    toSVGPathCommand(): SVGPathCommand;
}

abstract class AbsoluteCommand implements Command {
    constructor(
        readonly startingPoint: Point2D,
        readonly endingPoint: Point2D
    ) { }

    public getEndingPoint(): Point2D {
        return this.endingPoint;
    }
    abstract getStartDirection(): Vector2D | undefined;
    abstract getEndDirection(): Vector2D | undefined;
    abstract toSVGPathCommand(): SVGPathCommand;

}

abstract class RelativeCommand implements Command {
    constructor(
        readonly startingPoint: Point2D,
        readonly endingPoint: Vector2D
    ) { }

    public getEndingPoint(): Point2D {
        return this.startingPoint.add(this.endingPoint);
    }
    abstract getStartDirection(): Vector2D | undefined;
    abstract getEndDirection(): Vector2D | undefined;
    abstract toSVGPathCommand(): SVGPathCommand;
}

export class AbsoluteMoveTo extends AbsoluteCommand {
    public getStartDirection(): Vector2D | undefined {
        return Vector2D.from(this.startingPoint, this.endingPoint).unit();
    }
    public getEndDirection(): Vector2D | undefined {
        return this.getStartDirection();
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new AbsoluteMoveCommand(this.endingPoint);
    }
}

export class RelativeMoveTo extends RelativeCommand {
    public getStartDirection(): Vector2D | undefined {
        return this.endingPoint.unit();
    }
    public getEndDirection(): Vector2D | undefined {
        return this.getStartDirection();
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new RelativeMoveCommand(this.endingPoint);
    }
}

class AbsoluteLineTo extends AbsoluteCommand {
    public getStartDirection(): Vector2D | undefined {
        return Vector2D.from(this.startingPoint, this.endingPoint).unit();
    }
    public getEndDirection(): Vector2D | undefined {
        return this.getStartDirection();
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new AbsoluteLineCommand(this.endingPoint);
    }
}

class RelativeLineTo extends RelativeCommand {
    public getStartDirection(): Vector2D | undefined {
        return this.endingPoint.unit();
    }
    public getEndDirection(): Vector2D | undefined {
        return this.getStartDirection();
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new RelativeLineCommand(this.endingPoint);
    }
}

export class AbsoluteQuadraticBezierCurve extends AbsoluteCommand {
    constructor(
        startingPoint: Point2D,
        readonly controlPoint: Point2D,
        endingPoint: Point2D
    ) {
        super(startingPoint, endingPoint);
    }

    public getStartDirection(): Vector2D | undefined {
        return Vector2D.from(this.startingPoint, this.controlPoint).unit();
    }
    public getEndDirection(): Vector2D {
        return Vector2D.from(this.controlPoint, this.endingPoint).unit();
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new AbsoluteQuadraticBezierCurveCommand(this.controlPoint, this.endingPoint);
    }
}

export class RelativeQuadraticBezierCurve extends RelativeCommand {
    constructor(
        startingPoint: Point2D,
        readonly controlPoint: Vector2D,
        endingPoint: Vector2D
    ) {
        super(startingPoint, endingPoint);
    }

    public getStartDirection(): Vector2D | undefined {
        return this.controlPoint.unit();
    }
    public getEndDirection(): Vector2D {
        return this.endingPoint.subtract(this.controlPoint).unit();
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new RelativeQuadraticBezierCurveCommand(this.controlPoint, this.endingPoint);
    }
}

export class AbsoluteCubicBezierCurve extends AbsoluteCommand {
    constructor(
        startingPoint: Point2D,
        readonly firstControlPoint: Point2D,
        readonly secondControlPoint: Point2D,
        endingPoint: Point2D
    ) {
        super(startingPoint, endingPoint);
    }

    public getStartDirection(): Vector2D | undefined {
        return Vector2D.from(this.startingPoint, this.firstControlPoint).unit();
    }
    public getEndDirection(): Vector2D {
        return Vector2D.from(this.secondControlPoint, this.endingPoint).unit();
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new AbsoluteCubicBezierCurveCommand(this.firstControlPoint, this.secondControlPoint, this.endingPoint);
    }
}

export class RelativeCubicBezierCurve extends RelativeCommand {
    constructor(
        startingPoint: Point2D,
        readonly firstControlPoint: Vector2D,
        readonly secondControlPoint: Vector2D,
        endingPoint: Vector2D
    ) {
        super(startingPoint, endingPoint);
    }

    public getStartDirection(): Vector2D | undefined {
        return this.firstControlPoint.unit();
    }
    public getEndDirection(): Vector2D {
        return this.endingPoint.subtract(this.secondControlPoint).unit();
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new RelativeCubicBezierCurveCommand(this.firstControlPoint, this.secondControlPoint, this.endingPoint);
    }
}

// export class CubicBezierCircularArc implements Command {
//     readonly arc: CircularArc;
//     readonly cubicBezierCurve: CubicBezierCurve;
//
//     private constructor(
//         private readonly commandMode: CommandMode,
//         readonly startingPoint: Point2D,
//         ...args: [radius: number, startAngle: number, endAngle: number,] | [arc: CircularArc]
//     ) {
//         let radius: number;
//         let startAngle: number;
//         let endAngle: number;
//
//         if (args.length === 1) {
//             this.arc = args[0];
//             startAngle = this.arc.startAngle;
//             endAngle = this.arc.endAngle;
//         } else {
//             radius = args[0];
//             startAngle = args[1];
//             endAngle = args[2];
//             this.arc = new CircularArc(radius, startAngle, endAngle);
//         }
//         const startVec = this.arc.startingPointVector;
//         const center = startingPoint.add(startVec.opposite());
//         const endingPoint = center.add(this.arc.endingPointVector);
//
//         // derivative at (radius * cos(angle), radius * sin(angle)) = (radius * sin(angle), -radius * cos(angle))
//         const startControlVector = this.arc.startingTangentVector;
//         const endControlVector = this.arc.endingTangentVector;
//
//         // scalar factor = 4 / 3 * tan((endAngle - startAngle) / 4))
//         const factor = (4.0 / 3.0) * Math.tan((endAngle - startAngle) / 4);
//         startControlVector.scale(factor);
//         endControlVector.scale(-factor);
//
//         this.cubicBezierCurve = new CubicBezierCurve(
//             startingPoint, startingPoint.add(startControlVector),
//             endingPoint.add(endControlVector), endingPoint
//         );
//     }
//
//     public static absolute(startingPoint: Point2D, radius: number, startAngle: number, endAngle: number): CubicBezierCircularArc;
//     public static absolute(startingPoint: Point2D, arc: CircularArc): CubicBezierCircularArc;
//     public static absolute(
//         startingPoint: Point2D,
//         ...args: [radius: number, startAngle: number, endAngle: number] | [arc: CircularArc]
//     ) {
//         return new CubicBezierCircularArc(
//             CommandMode.ABSOLUTE,
//             startingPoint, ...args
//         );
//     }
//
//     public static relative(startingPoint: Point2D, radius: number, startAngle: number, endAngle: number): CubicBezierCircularArc;
//     public static relative(startingPoint: Point2D, arc: CircularArc): CubicBezierCircularArc;
//     public static relative(
//         startingPoint: Point2D,
//         ...args: [radius: number, startAngle: number, endAngle: number] | [arc: CircularArc]
//     ) {
//         return new CubicBezierCircularArc(
//             CommandMode.RELATIVE,
//             startingPoint, ...args
//         );
//     }
//
//     getEndingPoint(): Point2D {
//         return this.cubicBezierCurve.endingPoint;
//     }
//     getStartDirection(): Vector2D | undefined {
//         return Vector2D.from(this.cubicBezierCurve.startingPoint, this.cubicBezierCurve.firstControlPoint);
//     }
//     getEndDirection(): Vector2D | undefined {
//         return Vector2D.from(this.cubicBezierCurve.secondControlPoint, this.cubicBezierCurve.endingPoint);
//     }
//     toSVGPathCommand(): SVGPathCommand {
//         const startingPoint = this.cubicBezierCurve.startingPoint;
//         return this.commandMode === CommandMode.ABSOLUTE ?
//             new AbsoluteCubicBezierCurveCommand(
//                 this.cubicBezierCurve.firstControlPoint,
//                 this.cubicBezierCurve.secondControlPoint,
//                 this.cubicBezierCurve.endingPoint
//             ):
//             new RelativeCubicBezierCurveCommand(
//                 Vector2D.from(startingPoint, this.cubicBezierCurve.firstControlPoint),
//                 Vector2D.from(startingPoint, this.cubicBezierCurve.secondControlPoint),
//                 Vector2D.from(startingPoint, this.cubicBezierCurve.endingPoint)
//             );
//     }
// }

export class CubicBezierEllipticalArc implements Command {
    readonly arc: EllipticalArc;
    readonly cubicBezierCurve: CubicBezierCurve;

    private constructor(
        private readonly commandMode: CommandMode,
        readonly startingPoint: Point2D,
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
        const center = startingPoint.add(startVec.opposite());
        const endingPoint = center.add(this.arc.endingPointVector);

        // derivative at (semiMajorAxis * cos(angle), semiMinorAxis * sin(angle)) = (semiMajorAxis * sin(angle), -semiMinorAxis * cos(angle))
        const startControlVector = this.arc.startingTangentVector;
        const endControlVector = this.arc.endingTangentVector;

        // scalar factor = 4 / 3 * tan((endAngle - startAngle) / 4))
        const factor = (4.0 / 3.0) * Math.tan((endAngle - startAngle) / 4);
        startControlVector.scale(factor);
        endControlVector.scale(-factor);

        this.cubicBezierCurve = new CubicBezierCurve(
            startingPoint, startingPoint.add(startControlVector),
            endingPoint.add(endControlVector), endingPoint
        );
    }

    public static absolute(
        startingPoint: Point2D,
        semiMajorAxis: number, semiMinorAxis: number,
        startAngle: number, endAngle: number,
        ellipseTilt?: number
    ): CubicBezierEllipticalArc;
    public static absolute(
        startingPoint: Point2D,
        ellipticalArc: EllipticalArc
    ): CubicBezierEllipticalArc;
    public static absolute(
        startingPoint: Point2D,
        ...args: [semiMajorAxis: number, semiMinorAxis: number,
            startAngle: number, endAngle: number,
            ellipseTilt?: number] | [arc: EllipticalArc]
    ) {
        return new CubicBezierEllipticalArc(
            CommandMode.ABSOLUTE,
            startingPoint, ...args
        );
    }

    public static relative(
        startingPoint: Point2D,
        semiMajorAxis: number, semiMinorAxis: number,
        startAngle: number, endAngle: number,
        ellipseTilt?: number
    ): CubicBezierEllipticalArc;
    public static relative(
        startingPoint: Point2D,
        ellipticalArc: EllipticalArc
    ): CubicBezierEllipticalArc;
    public static relative(
        startingPoint: Point2D,
        ...args: [semiMajorAxis: number, semiMinorAxis: number,
            startAngle: number, endAngle: number,
            ellipseTilt?: number] | [arc: EllipticalArc]
    ) {
        return new CubicBezierEllipticalArc(
            CommandMode.RELATIVE,
            startingPoint, ...args
        );
    }

    getEndingPoint(): Point2D {
        return this.cubicBezierCurve.endingPoint;
    }
    getStartDirection(): Vector2D | undefined {
        return Vector2D.from(this.cubicBezierCurve.startingPoint, this.cubicBezierCurve.firstControlPoint);
    }
    getEndDirection(): Vector2D | undefined {
        return Vector2D.from(this.cubicBezierCurve.secondControlPoint, this.cubicBezierCurve.endingPoint);
    }
    toSVGPathCommand(): SVGPathCommand {
        const startingPoint = this.cubicBezierCurve.startingPoint;
        return this.commandMode === CommandMode.ABSOLUTE ?
            new AbsoluteCubicBezierCurveCommand(
                this.cubicBezierCurve.firstControlPoint,
                this.cubicBezierCurve.secondControlPoint,
                this.cubicBezierCurve.endingPoint
            ):
            new RelativeCubicBezierCurveCommand(
                Vector2D.from(startingPoint, this.cubicBezierCurve.firstControlPoint),
                Vector2D.from(startingPoint, this.cubicBezierCurve.secondControlPoint),
                Vector2D.from(startingPoint, this.cubicBezierCurve.endingPoint)
            );
    }
}

export class AbsoluteEllipticalArc extends AbsoluteCommand {
    constructor(
        startingPoint: Point2D,
        readonly xRadius: number,
        readonly yRadius: number,
        readonly xAxisRotation: number,
        readonly largeArcFlag: 0 | 1,
        readonly sweepFlag: 0 | 1,
        endingPoint: Point2D
    ) {
        super(startingPoint, endingPoint);
    }

    // TODO: Write the actual implementation
    public getStartDirection(): Vector2D | undefined {
        return undefined;
    }
    public getEndDirection(): Vector2D | undefined {
        return undefined;
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new AbsoluteEllipticalArcCommand(this.xRadius, this.yRadius, this.xAxisRotation, this.largeArcFlag, this.sweepFlag, this.endingPoint);
    }
}

export class RelativeEllipticalArc extends RelativeCommand {
    constructor(
        startingPoint: Point2D,
        readonly xRadius: number,
        readonly yRadius: number,
        readonly xAxisRotation: number,
        readonly largeArcFlag: 0 | 1,
        readonly sweepFlag: 0 | 1,
        endingPoint: Vector2D
    ) {
        super(startingPoint, endingPoint);
    }

    // TODO: Write the actual implementation
    public getStartDirection(): Vector2D | undefined {
        return undefined;
    }
    public getEndDirection(): Vector2D | undefined {
        return undefined;
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new RelativeEllipticalArcCommand(this.xRadius, this.yRadius, this.xAxisRotation, this.largeArcFlag, this.sweepFlag, this.endingPoint);
    }
}

export class RelativeClosePath extends RelativeCommand {
    constructor(
        startingPoint: Point2D,
        readonly moveCommand: AbsoluteMoveTo | RelativeMoveTo
    ) {
        super(
            startingPoint, moveCommand instanceof RelativeMoveTo ?
                moveCommand.endingPoint : Vector2D.from(startingPoint, moveCommand.endingPoint)
        );
    }

    public getStartDirection(): Vector2D {
        return this.endingPoint;
    }
    public getEndDirection(): Vector2D {
        return this.getStartDirection();
    }
    public toSVGPathCommand(): SVGPathCommand {
        return new RelativeClosePathCommand();
    }
}

export class PathBuilder {
    private commands: Command[] = [];
    private openPathStack: (RelativeMoveTo | AbsoluteMoveTo)[] = [];

    get currentPosition() {
        return this.lastCommand?.getEndingPoint() ?? Point2D.of(0, 0);
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

    public append(command: Command) {
        this.commands.push(command);
        return this;
    }

    // Relative move
    public m(point: Vector2D) {
        const startingPoint = this.currentPosition;
        const moveCommand = new RelativeMoveTo(startingPoint, point);
        this.commands.push(moveCommand);
        this.openPathStack.push(moveCommand);
        return this;
    }

    // Absolute move
    public M(point: Point2D) {
        const startingPoint = this.currentPosition;
        const moveCommand = new AbsoluteMoveTo(startingPoint, point);
        this.commands.push(moveCommand);
        this.openPathStack.push(moveCommand);
        return this;
    }

    // Relative line
    public l(point: Vector2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(new RelativeLineTo(startingPoint, point));
        return this;
    }

    // Absolute line
    public L(point: Point2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(new AbsoluteLineTo(startingPoint, point));
        return this;
    }

    // Relative quadratic Bézier curve
    public q(controlPoint: Vector2D, endPoint: Vector2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(new RelativeQuadraticBezierCurve(startingPoint, controlPoint, endPoint));
        return this;
    }

    // Absolute quadratic Bézier curve
    public Q(controlPoint: Point2D, endingPoint: Point2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(new AbsoluteQuadraticBezierCurve(startingPoint, controlPoint, endingPoint));
        return this;
    }

    // Relative cubic Bézier curve
    public c(firstControlPoint: Vector2D, secondControlPoint: Vector2D, endingPoint: Vector2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(new RelativeCubicBezierCurve(startingPoint, firstControlPoint, secondControlPoint, endingPoint));
        return this;
    }

    // Absolute cubic Bézier curve
    public C(firstControlPoint: Point2D, secondControlPoint: Point2D, endingPoint: Point2D) {
        const startingPoint = this.currentPosition;
        this.commands.push(new AbsoluteCubicBezierCurve(startingPoint, firstControlPoint, secondControlPoint, endingPoint));
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
        this.commands.push(new RelativeEllipticalArc(startingPoint, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint));
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
        this.commands.push(new AbsoluteEllipticalArc(startingPoint, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint));
        return this;
    }

    // Relative arc by cubic Bézier
    public cForCircularArc(radius: number, startAngle: number, endAngle: number, rotation?: number): this;
    public cForCircularArc(circularArc: CircularArc): this;
    public cForCircularArc(...args:
        [radius: number, startAngle: number, endAngle: number, rotation?: number] |
        [circularArc: CircularArc]
    ) {
        const startingPoint = this.currentPosition;
        if (args.length === 1) {
            const arc = args[0];
            this.commands.push(CubicBezierEllipticalArc.relative(
                startingPoint,
                arc.radius, arc.radius, arc.startAngle, arc.endAngle, arc.rotation
            ));
        } else {
            const radius = args[0];
            this.commands.push(CubicBezierEllipticalArc.relative(
                startingPoint,
                radius, radius, args[1], args[2], args[3]
            ));
        }
        return this;
    }

    // Absolute arc by cubic Bézier
    public CForCircularArc(radius: number, startAngle: number, endAngle: number, rotation: number): this;
    public CForCircularArc(circularArc: CircularArc): this;
    public CForCircularArc(...args:
        [radius: number, startAngle: number, endAngle: number, rotation: number] |
        [circularArc: CircularArc]
    ) {
        const startingPoint = this.currentPosition;
        if (args.length === 1) {
            const arc = args[0];
            this.commands.push(CubicBezierEllipticalArc.absolute(
                startingPoint,
                arc.radius, arc.radius, arc.startAngle, arc.endAngle, arc.rotation
            ));
        } else {
            const radius = args[0];
            this.commands.push(CubicBezierEllipticalArc.absolute(
                startingPoint,
                radius, radius, args[1], args[2], args[3]
            ));
        }
        return this;
    }

    public cForEllipticalArc(
        semiMajorAxis: number, semiMinorAxis: number,
        startAngle: number, endAngle: number,
        ellipseTilt?: number
    ): this;
    public cForEllipticalArc(ellipticalArc: EllipticalArc): this;
    public cForEllipticalArc(...args:
        [
            semiMajorAxis: number, semiMinorAxis: number,
            startAngle: number, endAngle: number,
            ellipseTilt?: number
        ] | [arc: EllipticalArc]
    ) {
        const startingPoint = this.currentPosition;
        this.commands.push(CubicBezierEllipticalArc.relative(
            startingPoint,
            // @ts-ignore
            ...args
        ));
        return this;
    }

    public CForEllipticalArc(
        semiMajorAxis: number, semiMinorAxis: number,
        startAngle: number, endAngle: number,
        ellipseTilt?: number
    ): this;
    public CForEllipticalArc(ellipticalArc: EllipticalArc): this;
    public CForEllipticalArc(...args:
        [
            semiMajorAxis: number, semiMinorAxis: number,
            startAngle: number, endAngle: number,
            ellipseTilt?: number
        ] | [arc: EllipticalArc]
    ) {
        const startingPoint = this.currentPosition;
        this.commands.push(CubicBezierEllipticalArc.absolute(
            startingPoint,
            // @ts-ignore
            ...args
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
            Vector2D.of(Math.cos(startAngle), Math.sin(startAngle)) :
            this.lastCommand?.getEndDirection()?.unit() ?? null;
        const endDirection: Vector2D | null = endAngle !== undefined ?
            Vector2D.of(Math.cos(endAngle), Math.sin(endAngle)) :
            null;
        const origin = Point2D.of(0, 0);
        const {firstControlPoint, secondControlPoint} = cubicBezierAutoControl(
            origin, endingPoint.toPoint(),
            startDirection ?? undefined, endDirection ?? undefined,
            startHandleScale, endHandleScale
        );
        this.commands.push(new RelativeCubicBezierCurve(
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
            Vector2D.of(Math.cos(startAngle), Math.sin(startAngle)) :
            this.lastCommand?.getEndDirection() ?? null;
        const endDirection: Vector2D | null = endAngle !== undefined ?
            Vector2D.of(Math.cos(endAngle), Math.sin(endAngle)) :
            null;
        const {firstControlPoint, secondControlPoint} = cubicBezierAutoControl(
            startingPoint, endingPoint,
            startDirection ?? undefined, endDirection ?? undefined,
            startHandleScale, endHandleScale
        );
        this.commands.push(new AbsoluteCubicBezierCurve(
            startingPoint,
            firstControlPoint,
            secondControlPoint,
            endingPoint
        ));
        return this;
    }

    public z() {
        const startingPoint = this.currentPosition;
        this.commands.push(new RelativeClosePath(startingPoint, this.openPathStack.pop()!));
        return this;
    }

    public toPath() {
        return new SVGPath(this.commands.map(c => c.toSVGPathCommand()));
    }

    public toString() {
        return this.toPath().toString();
    }
}