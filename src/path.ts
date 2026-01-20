import {Point2D} from "./point2D";
import {Vector2D} from "./vector2D";
import {CubicBezierCurve} from "./cubic-bezier-curve";
import {
    AbsoluteClosePathPrimitive,
    AbsoluteCubicBezierCurvePrimitive,
    AbsoluteEllipticalArcPrimitive,
    AbsoluteLinePrimitive,
    AbsoluteMovePrimitive,
    AbsoluteQuadraticBezierCurvePrimitive,
    PrimitiveCommand, SVGPath
} from "./svg-path";
import {EllipticalArc} from "./curves/ellipse";

export interface Command {
    readonly initialPoint: Point2D;
    readonly terminalPoint: Point2D;

    getStartVelocity(): Vector2D;
    getEndVelocity(): Vector2D;
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
        return Vector2D.NULL_VECTOR;
    }
    public getEndVelocity(): Vector2D {
        return Vector2D.NULL_VECTOR;
    }
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteMovePrimitive(this.terminalPoint);
    }
}

export class LineCommand implements Command {
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
        return Vector2D.from(this.initialPoint, this.terminalPoint);
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
        const center = initialPoint.add(startVec.scale(-1));
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
    readonly arc: EllipticalArc;

    constructor(initialPoint: Point2D, semiMajorAxis: number, semiMinorAxis: number, startAngle: number, endAngle: number, ellipseTilt?: number);
    constructor(initialPoint: Point2D, arc: EllipticalArc);
    constructor(
        readonly initialPoint: Point2D,
        ...args: [semiMajorAxis: number, semiMinorAxis: number,
            startAngle: number, endAngle: number,
            ellipseTilt?: number] | [arc: EllipticalArc]
    ) {
        if (args.length === 1) {
            this.arc = args[0];
        } else {
            this.arc = new EllipticalArc(
                args[0], args[1],
                args[2], args[3], args[4]
            );
        }
        const center = initialPoint.add(this.arc.startingPointVector.scale(-1));
        this.terminalPoint = center.add(this.arc.endingPointVector);
    }

    getEndVelocity(): Vector2D {
        return this.arc.endingTangentVector;
    }

    getStartVelocity(): Vector2D {
        return this.arc.startingTangentVector;
    }

    toSVGPathCommand(): PrimitiveCommand {
        const angleDiff = this.arc.endAngle - this.arc.startAngle;
        return new AbsoluteEllipticalArcPrimitive(
            this.arc.semiMajorAxis, this.arc.semiMinorAxis,
            this.arc.ellipseTilt * 180 / Math.PI, angleDiff > Math.PI ? 1 : 0,
            angleDiff > 0 ? 1 : 0, this.terminalPoint
        );
    }
}

export class EllipticalArcWrapperCommand implements Command {
    readonly terminalPoint: Point2D;
    readonly arc: EllipticalArc;

    constructor(initialPoint: Point2D, xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: boolean, sweepFlag: boolean, endingPoint: Point2D);
    constructor(initialPoint: Point2D, xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: boolean, sweepFlag: boolean, endingPointVector: Vector2D);
    constructor(
        readonly initialPoint: Point2D,
        readonly xRadius: number,
        readonly yRadius: number,
        readonly xAxisRotation: number,
        readonly largeArcFlag: boolean,
        readonly sweepFlag: boolean,
        endingPoint: Point2D | Vector2D
    ) {
        this.terminalPoint = endingPoint instanceof Point2D ? endingPoint :
            initialPoint.add(endingPoint);

        let rx = Math.abs(xRadius)
        let ry = Math.abs(yRadius)

        // transform to arc space
        const midPointToStart = Vector2D.from(this.terminalPoint, initialPoint)
            .scale(1 / 2).rotate(-xAxisRotation);

        // scale radii
        const lambda =
            (midPointToStart.x * midPointToStart.x) / (rx * rx) +
            (midPointToStart.y * midPointToStart.y) / (ry * ry)

        if (lambda > 1) {
            const s = Math.sqrt(lambda)
            rx *= s
            ry *= s
        }

        // find center in arc space
        const rx_sqr = rx * rx
        const ry_sqr = ry * ry
        const x_sqr = midPointToStart.x * midPointToStart.x
        const y_sqr = midPointToStart.y * midPointToStart.y

        const sign = (largeArcFlag === sweepFlag) ? -1 : 1
        const num = rx_sqr * ry_sqr - rx_sqr * y_sqr - ry_sqr * x_sqr
        const den = rx_sqr * y_sqr + ry_sqr * x_sqr
        const c = sign * Math.sqrt(Math.max(0, num / den))

        const centerLocal = Point2D.of(
            c * ( rx * midPointToStart.y) / ry,
            c * (-ry * midPointToStart.x) / rx
        );

        // parametric angles
        let theta1 = Math.atan2(
            (midPointToStart.y - centerLocal.y) / ry,
            (midPointToStart.x - centerLocal.x) / rx
        );
        let theta2 = Math.atan2(
            (-midPointToStart.y - centerLocal.y) / ry,
            (-midPointToStart.x - centerLocal.x) / rx
        );

        // adjusting angle difference based on the sweep flag
        if (sweepFlag && theta1 > theta2)
            theta2 += 2 * Math.PI;
        if (!sweepFlag && theta1 < theta2)
            theta1 += 2 * Math.PI;

        this.arc = new EllipticalArc(rx, ry, theta1, theta2, xAxisRotation);
    }

    public getStartVelocity(): Vector2D {
        const velocity = this.arc.startingTangentVector;
        return this.sweepFlag ? velocity : velocity.scale(-1);
    }
    public getEndVelocity(): Vector2D {
        const velocity = this.arc.endingTangentVector;
        return this.sweepFlag ? velocity : velocity.scale(-1);
    }
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteEllipticalArcPrimitive(this.xRadius, this.yRadius, this.xAxisRotation * 180 / Math.PI, this.largeArcFlag ? 1 : 0, this.sweepFlag ? 1 : 0, this.terminalPoint);
    }
}

export class ChordScaledBezierCommand implements Command {
    readonly terminalPoint: Point2D;
    readonly cubicBezierCurve: CubicBezierCurve;

    constructor(initialPoint: Point2D, terminalPoint: Point2D, startDirection: Vector2D, endDirection: Vector2D, startHandleScale?: number, endHandleScale?: number);
    constructor(initialPoint: Point2D, terminalPointVector: Vector2D, startDirection: Vector2D, endDirection: Vector2D, startHandleScale?: number, endHandleScale?: number);
    constructor(
        readonly initialPoint: Point2D,
        terminalPoint: Point2D | Vector2D,
        readonly startDirection: Vector2D,
        readonly endDirection: Vector2D,
        readonly startHandleScale: number = 1 / 3,
        readonly endHandleScale: number = startHandleScale
    ) {
        this.terminalPoint = terminalPoint instanceof Point2D ? terminalPoint :
            initialPoint.add(terminalPoint);
        const chord = Vector2D.from(initialPoint, this.terminalPoint);
        const chordLen = chord.magnitude;
        if (chordLen < 1e-9) { // degenerate case
            this.cubicBezierCurve = new CubicBezierCurve(
                initialPoint, initialPoint, this.terminalPoint, this.terminalPoint
            );
            return;
        }

        const firstControlPoint = initialPoint.add(
            startDirection.normalize().scale(chordLen * startHandleScale)
        );
        const secondControlPoint: Point2D = this.terminalPoint.add(
            endDirection.normalize().scale(chordLen * endHandleScale)
        );

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

export class Path {
    constructor(private readonly commands: Command[]) {}

    public toSVGPath() {
        return new SVGPath(this.commands.map(c => c.toSVGPathCommand()));
    }
    public toSVGPathString() {
        return this.toSVGPath().toString();
    }
}