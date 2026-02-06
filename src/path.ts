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
    PrimitiveCommand,
    SVGPath
} from "./svg-path";
import {EllipticalArc} from "./curves/ellipse";
import {Angle} from "./angle";

export interface Command {
    /** Starting point of the command. */
    readonly initialPoint: Point2D;
    /** End point after executing the command. */
    readonly terminalPoint: Point2D;

    /** Tangent vector at the start. */
    getStartVelocity(): Vector2D;
    /** Tangent vector at the end. */
    getEndVelocity(): Vector2D;
    /** Convert to a serializable SVG command. */
    toSVGPathCommand(): PrimitiveCommand;
}

/** Wrapper around move (M) command. */
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

    /** Moves do not contribute velocity. */
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

/** Wrapper around straight line (L) command. */
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

    /** Euclidean length between initial and terminal points. */
    get length() {
        return Math.hypot(this.terminalPoint.x - this.initialPoint.x, this.terminalPoint.y - this.initialPoint.y);
    }

    /** Constant velocity along the line. */
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

/** Wrapper around quadratic Bézier (Q) command. */
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

/** Wrapper around cubic Bézier (C) command. */
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

/**
 * This command gives you the closest cubic Bézier approximation of an elliptical arc parameterized by the semi-axes and angular parameters.
 *
 * > Keep in mind that `startAngle` and `endAngle` are not central angles; they are parametric angles. The central angle of a point on an ellipse is the angle the vector from the center to that point makes with the horizontal semi-axis. This is not the same as the parametric angle of the point, which is what goes into the parametric equations of an ellipse: x(θ) = a cos(θ) and y(θ) = b sin(θ).
 * > In the case of a circle, however, the parametric angles and the central angles are the same.
 */
export class CubicBezierEllipticalArc implements Command {
    readonly arc: EllipticalArc;
    readonly cubicBezierCurve: CubicBezierCurve;

    constructor(initialPoint: Point2D, semiMajorAxis: number, semiMinorAxis: number, startAngle: number | Angle, endAngle: number | Angle, ellipseTilt?: number | Angle);
    constructor(initialPoint: Point2D, arc: EllipticalArc);
    constructor(
        readonly initialPoint: Point2D,
        ...args: [semiMajorAxis: number, semiMinorAxis: number,
        startAngle: number | Angle, endAngle: number | Angle,
        ellipseTilt?: number | Angle] | [arc: EllipticalArc]
    ) {
        if (args.length === 1) {
            this.arc = args[0];
        } else {
            this.arc = new EllipticalArc(
                args[0], args[1],
                args[2], args[3],
                args[4]
            );
        }
        const startVec = this.arc.startingPointVector;
        const center = initialPoint.add(startVec.scale(-1));
        const endingPoint = center.add(this.arc.endingPointVector);

        // derivative at (semiMajorAxis * cos(angle), semiMinorAxis * sin(angle)) = (-semiMajorAxis * sin(angle), semiMinorAxis * cos(angle))
        const startControlVector = this.arc.startingTangentVector;
        const endControlVector = this.arc.endingTangentVector;

        // scalar factor = 4 / 3 * tan((endAngle - startAngle) / 4))
        const factor = (4.0 / 3.0) * Math.tan((this.arc.endAngle.value - this.arc.startAngle.value) / 4);
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
    /** Convert to SVG cubic curve primitive. */
    toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteCubicBezierCurvePrimitive(
            this.cubicBezierCurve.firstControlPoint,
            this.cubicBezierCurve.secondControlPoint,
            this.cubicBezierCurve.endingPoint
        );
    }
}

/** Cubic Bézier Hermite (two-velocity) command. */
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
    /** Convert to SVG cubic curve primitive. */
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteCubicBezierCurvePrimitive(
            this.initialPoint.add(this.startVelocity.clone().scale(1 / 3)),
            this.terminalPoint.add(this.endVelocity.clone().scale(-1 / 3)),
            this.terminalPoint
        );
    }
}

/**
 * This command lets you draw elliptical arcs with SVG path elliptical arc (A) commands without having to deal with all the confusing flags.
 * You just have to specify the semi-axes and parametric angles or provide an {@link EllipticalArc} object.
 *
 * > Keep in mind that `startAngle` and `endAngle` are not central angles; they are parametric angles. The central angle of a point on an ellipse is the angle the vector from the center to that point makes with the horizontal semi-axis. This is not the same as the parametric angle of the point, which is what goes into the parametric equations of an ellipse: x(θ) = a cos(θ) and y(θ) = b sin(θ).
 * > In the case of a circle, however, the parametric angles and the central angles are the same.
 */
export class EllipticalArcCommand implements Command {
    readonly terminalPoint: Point2D;
    readonly arc: EllipticalArc;

    constructor(initialPoint: Point2D, semiMajorAxis: number, semiMinorAxis: number, startAngle: number | Angle, endAngle: number | Angle, ellipseTilt?: number | Angle);
    constructor(initialPoint: Point2D, arc: EllipticalArc);
    constructor(
        readonly initialPoint: Point2D,
        ...args: [semiMajorAxis: number, semiMinorAxis: number,
            startAngle: number | Angle, endAngle: number | Angle,
            ellipseTilt?: number | Angle] | [arc: EllipticalArc]
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

    /** Convert to SVG arc primitive. */
    toSVGPathCommand(): PrimitiveCommand {
        const angleDiff = this.arc.endAngle.value - this.arc.startAngle.value;
        return new AbsoluteEllipticalArcPrimitive(
            this.arc.semiMajorAxis, this.arc.semiMinorAxis,
            this.arc.ellipseTilt.toDegrees(), angleDiff > Math.PI ? 1 : 0,
            angleDiff > 0 ? 1 : 0, this.terminalPoint
        );
    }
}

/**
 * Wrapper around elliptical arc (A) command.
 *
 * > `xAxisRotation` is entered in radians to stay in concert with the rest of the API. This is contrary to what the primitive elliptical arc (`A`) command expects—angle in degrees.
 */
export class EllipticalArcWrapperCommand implements Command {
    readonly terminalPoint: Point2D;
    readonly xAxisRotation: Angle;
    readonly arc: EllipticalArc;

    constructor(initialPoint: Point2D, xRadius: number, yRadius: number, xAxisRotation: number | Angle, largeArcFlag: boolean, sweepFlag: boolean, endingPoint: Point2D);
    constructor(initialPoint: Point2D, xRadius: number, yRadius: number, xAxisRotation: number | Angle, largeArcFlag: boolean, sweepFlag: boolean, endingPointVector: Vector2D);
    constructor(
        readonly initialPoint: Point2D,
        readonly xRadius: number,
        readonly yRadius: number,
        xAxisRotation: number | Angle,
        readonly largeArcFlag: boolean,
        readonly sweepFlag: boolean,
        endingPoint: Point2D | Vector2D
    ) {
        this.xAxisRotation = xAxisRotation instanceof Angle ? xAxisRotation : Angle.of(xAxisRotation);
        this.terminalPoint = endingPoint instanceof Point2D ? endingPoint :
            initialPoint.add(endingPoint);

        let rx = Math.abs(xRadius)
        let ry = Math.abs(yRadius)

        // transform to arc space
        const midPointToStart = Vector2D.from(this.terminalPoint, initialPoint)
            .scale(1 / 2).rotate(this.xAxisRotation.negated());

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

        this.arc = new EllipticalArc(rx, ry, theta1, theta2, this.xAxisRotation);
    }

    public getStartVelocity(): Vector2D {
        const velocity = this.arc.startingTangentVector;
        return this.sweepFlag ? velocity : velocity.scale(-1);
    }
    public getEndVelocity(): Vector2D {
        const velocity = this.arc.endingTangentVector;
        return this.sweepFlag ? velocity : velocity.scale(-1);
    }
    /** Convert to SVG arc primitive. */
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteEllipticalArcPrimitive(this.xRadius, this.yRadius, this.arc.ellipseTilt.toDegrees(), this.largeArcFlag ? 1 : 0, this.sweepFlag ? 1 : 0, this.terminalPoint);
    }
}

/**
 * Cubic Bézier whose handles are scaled relative to chord length and directed with angles.
 */
export class ChordScaledBezierCommand implements Command {
    readonly terminalPoint: Point2D;
    readonly cubicBezierCurve: CubicBezierCurve;

    constructor(initialPoint: Point2D, terminalPoint: Point2D, startHandleAngle: number | Angle, endHandleAngle: number | Angle, startHandleScale?: number, endHandleScale?: number);
    constructor(initialPoint: Point2D, terminalPointVector: Vector2D, startHandleAngle: number | Angle, endHandleAngle: number | Angle, startHandleScale?: number, endHandleScale?: number);
    constructor(
        readonly initialPoint: Point2D,
        terminalPoint: Point2D | Vector2D,
        readonly startHandleAngle: number | Angle,
        readonly endHandleAngle: number | Angle,
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
            Vector2D.polar(chordLen * startHandleScale, startHandleAngle)
        );
        const secondControlPoint: Point2D = this.terminalPoint.add(
            Vector2D.polar(chordLen * endHandleScale, endHandleAngle)
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
    /** Convert to SVG cubic curve primitive. */
    public toSVGPathCommand(): PrimitiveCommand {
        return new AbsoluteCubicBezierCurvePrimitive(
            this.cubicBezierCurve.firstControlPoint, this.cubicBezierCurve.secondControlPoint, this.terminalPoint
        );
    }
}

/** Wrapper around close-path (Z) command. */
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
    #commands: readonly Command[];
    constructor(commands: readonly Command[]) {
        this.#commands = commands;
    }

    /** Convert to a serializable SVG path. */
    public toSVGPath() {
        return new SVGPath(Object.freeze(this.#commands.map(c => c.toSVGPathCommand())));
    }
    /** Render the path to an SVG path string. */
    public toSVGPathString() {
        return this.toSVGPath().toString();
    }
}