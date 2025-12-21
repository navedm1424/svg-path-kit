import { cubicBezierAutoControl, cubicBezierCurveForCircularArc, cubicBezierCurveForEllipticalArc, cubicBezierCurveForSuperellipse } from "./cubic-bezier-curve";
import { round } from "../utils/math";
import { Vector2D } from "./vector2D";
import { Point2D } from "./point2D";
export class Command {
    constructor(mode = 'relative') {
        this.mode = mode;
    }
    coordinates(point) {
        return `${round(point.x, 4)} ${round(point.y, 4)}`;
    }
}
;
export class MoveCommand extends Command {
    constructor(startingPoint, endPoint, mode = 'relative') {
        super(mode);
        this.startingPoint = startingPoint;
        this.endPoint = endPoint;
    }
    toString() {
        const cmd = this.mode === 'relative' ? 'm' : 'M';
        const point = this.mode === 'relative' ? this.endPoint : this.startingPoint.add(this.endPoint);
        return `${cmd} ${this.coordinates(point)}`;
    }
    getEndPoint() {
        return this.startingPoint.add(this.endPoint);
    }
}
;
export class LineCommand extends Command {
    constructor(startingPoint, endPoint, mode = 'relative') {
        super(mode);
        this.startingPoint = startingPoint;
        this.endPoint = endPoint;
    }
    toString() {
        const cmd = this.mode === 'relative' ? 'l' : 'L';
        const end = this.mode === 'relative' ? this.endPoint : this.startingPoint.add(this.endPoint);
        return `${cmd} ${this.coordinates(end)}`;
    }
    getEndPoint() {
        return this.startingPoint.add(this.endPoint);
    }
}
;
export class QuadraticBezierCurveCommand extends Command {
    constructor(startingPoint, controlPoint, endPoint, mode = 'relative') {
        super(mode);
        this.startingPoint = startingPoint;
        this.controlPoint = controlPoint;
        this.endPoint = endPoint;
    }
    toString() {
        const cmd = this.mode === 'relative' ? 'q' : 'Q';
        const cp = this.mode === 'relative' ? this.controlPoint : this.startingPoint.add(this.controlPoint);
        const ep = this.mode === 'relative' ? this.endPoint : this.startingPoint.add(this.endPoint);
        return `${cmd} ${this.coordinates(cp)} ${this.coordinates(ep)}`;
    }
    getEndPoint() {
        return this.startingPoint.add(this.endPoint);
    }
}
;
export class CubicBezierCurveCommand extends Command {
    constructor(startingPoint, firstControlPoint, secondControlPoint, endPoint, mode = 'relative') {
        super(mode);
        this.startingPoint = startingPoint;
        this.firstControlPoint = firstControlPoint;
        this.secondControlPoint = secondControlPoint;
        this.endPoint = endPoint;
    }
    toString() {
        const cmd = this.mode === 'relative' ? 'c' : 'C';
        const cp1 = this.mode === 'relative' ? this.firstControlPoint : this.startingPoint.add(this.firstControlPoint);
        const cp2 = this.mode === 'relative' ? this.secondControlPoint : this.startingPoint.add(this.secondControlPoint);
        const ep = this.mode === 'relative' ? this.endPoint : this.startingPoint.add(this.endPoint);
        return `${cmd} ${this.coordinates(cp1)} ${this.coordinates(cp2)} ${this.coordinates(ep)}`;
    }
    getEndPoint() {
        return this.startingPoint.add(this.endPoint);
    }
}
;
export class EllipticalArcCommand extends Command {
    constructor(startingPoint, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint, mode = 'relative') {
        super(mode);
        this.startingPoint = startingPoint;
        this.xRadius = xRadius;
        this.yRadius = yRadius;
        this.xAxisRotation = xAxisRotation;
        this.largeArcFlag = largeArcFlag;
        this.sweepFlag = sweepFlag;
        this.endPoint = endPoint;
    }
    toString() {
        const cmd = this.mode === 'relative' ? 'a' : 'A';
        const ep = this.mode === 'relative' ? this.endPoint : this.startingPoint.add(this.endPoint);
        return `${cmd} ${this.xRadius} ${this.yRadius} ${this.xAxisRotation} ${this.largeArcFlag} ${this.sweepFlag} ${this.coordinates(ep)}`;
    }
    getEndPoint() {
        return this.startingPoint.add(this.endPoint);
    }
}
;
export class ClosePathCommand extends Command {
    constructor(pathStart, mode = 'relative') {
        super(mode);
        this.pathStart = pathStart;
    }
    toString() {
        return `z`;
    }
    getEndPoint() {
        return this.pathStart.startingPoint.add(this.pathStart.endPoint);
    }
}
;
export class Path {
    constructor(commands) {
        this.commands = commands;
    }
    toString() {
        return this.commands.map(c => c.toString()).join(' ');
    }
}
;
export class PathBuilder {
    get currentPosition() {
        return this.lastCommand?.getEndPoint() ?? Point2D.of(0, 0);
    }
    get lastCommand() {
        return this.commands.length === 0 ?
            null : this.commands[this.commands.length - 1];
    }
    constructor(point) {
        this.commands = [];
        this.openPathStack = [];
        if (point instanceof Vector2D)
            this.m(point);
        else
            this.M(point);
    }
    static m(point) {
        return new PathBuilder(point);
    }
    static M(point) {
        return new PathBuilder(point);
    }
    // Relative move
    m(point) {
        const startingPoint = this.currentPosition;
        const moveCommand = new MoveCommand(startingPoint, point, 'relative');
        this.commands.push(moveCommand);
        this.openPathStack.push(moveCommand);
        return this;
    }
    // Absolute move
    M(point) {
        const startingPoint = this.currentPosition;
        const endPointVector = Vector2D.from(startingPoint, point);
        const moveCommand = new MoveCommand(startingPoint, endPointVector, 'absolute');
        this.commands.push(moveCommand);
        this.openPathStack.push(moveCommand);
        return this;
    }
    // Relative line
    l(point) {
        const startingPoint = this.currentPosition;
        this.commands.push(new LineCommand(startingPoint, point, 'relative'));
        return this;
    }
    // Absolute line
    L(point) {
        const startingPoint = this.currentPosition;
        const endPointVector = Vector2D.from(startingPoint, point);
        this.commands.push(new LineCommand(startingPoint, endPointVector, 'absolute'));
        return this;
    }
    // Relative quadratic Bézier curve
    q(controlPoint, endPoint) {
        const startingPoint = this.currentPosition;
        this.commands.push(new QuadraticBezierCurveCommand(startingPoint, controlPoint, endPoint, 'relative'));
        return this;
    }
    // Absolute quadratic Bézier curve
    Q(controlPoint, endPoint) {
        const startingPoint = this.currentPosition;
        const controlPointVector = Vector2D.from(startingPoint, controlPoint);
        const endPointVector = Vector2D.from(startingPoint, endPoint);
        this.commands.push(new QuadraticBezierCurveCommand(startingPoint, controlPointVector, endPointVector, 'absolute'));
        return this;
    }
    // Relative cubic Bézier curve
    c(firstControlPoint, secondControlPoint, endPoint) {
        const startingPoint = this.currentPosition;
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPoint, secondControlPoint, endPoint, 'relative'));
        return this;
    }
    // Absolute cubic Bézier curve
    C(firstControlPoint, secondControlPoint, endPoint) {
        const startingPoint = this.currentPosition;
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endPoint);
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPointVector, secondControlPointVector, endPointVector, 'absolute'));
        return this;
    }
    // Relative elliptical arc (lowercase)
    a(xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint) {
        const startingPoint = this.currentPosition;
        this.commands.push(new EllipticalArcCommand(startingPoint, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint, 'relative'));
        return this;
    }
    // Absolute elliptical arc (uppercase)
    A(xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint) {
        const startingPoint = this.currentPosition;
        const endPointVector = Vector2D.from(startingPoint, endPoint);
        this.commands.push(new EllipticalArcCommand(startingPoint, xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPointVector, 'absolute'));
        return this;
    }
    cForCircularArc(...args) {
        const startingPoint = this.currentPosition;
        let cubicBezierCurve;
        if (typeof args[0] === "number" && args[1] instanceof Vector2D) {
            const absoluteEndPoint = startingPoint.add(args[1]);
            cubicBezierCurve = cubicBezierCurveForCircularArc(startingPoint, args[0], absoluteEndPoint);
        }
        else if (args[0] instanceof Vector2D && typeof args[1] === "number") {
            const absoluteCenter = startingPoint.add(args[0]);
            cubicBezierCurve = cubicBezierCurveForCircularArc(absoluteCenter, startingPoint, args[1]);
        }
        else {
            throw new Error("Invalid Arguments");
        }
        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endingPoint);
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPointVector, secondControlPointVector, endPointVector, 'relative'));
        return this;
    }
    CForCircularArc(...args) {
        const startingPoint = this.currentPosition;
        let cubicBezierCurve;
        if (typeof args[0] === "number" && args[1] instanceof Point2D) {
            cubicBezierCurve = cubicBezierCurveForCircularArc(startingPoint, args[0], args[1]);
        }
        else if (args[0] instanceof Point2D && typeof args[1] === "number") {
            cubicBezierCurve = cubicBezierCurveForCircularArc(args[0], startingPoint, args[1]);
        }
        else {
            throw new Error("Invalid Arguments");
        }
        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endingPoint);
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPointVector, secondControlPointVector, endPointVector, 'absolute'));
        return this;
    }
    cForEllipticalArc(center, angle, axisRatio, ellipseRotation = 0) {
        const startingPoint = this.currentPosition;
        const absoluteCenter = startingPoint.add(center);
        const cubicBezierCurve = cubicBezierCurveForEllipticalArc(absoluteCenter, startingPoint, angle, axisRatio, ellipseRotation);
        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endingPoint);
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPointVector, secondControlPointVector, endPointVector, 'relative'));
        return this;
    }
    CForEllipticalArc(center, angle, axisRatio, ellipseRotation = 0) {
        const startingPoint = this.currentPosition;
        const cubicBezierCurve = cubicBezierCurveForEllipticalArc(center, startingPoint, angle, axisRatio, ellipseRotation);
        const { firstControlPoint, secondControlPoint, endingPoint } = cubicBezierCurve;
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endingPoint);
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPointVector, secondControlPointVector, endPointVector, 'absolute'));
        return this;
    }
    cForSuperellipse(endingPoint, tilt, squareness) {
        const startingPoint = this.currentPosition;
        const cubicBezierCurve = cubicBezierCurveForSuperellipse(startingPoint, startingPoint.add(endingPoint), tilt, squareness);
        const { firstControlPoint, secondControlPoint } = cubicBezierCurve;
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, cubicBezierCurve.endingPoint);
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPointVector, secondControlPointVector, endPointVector, 'absolute'));
        return this;
    }
    // Relative smooth cubic Bézier curve (with optional angles and curvatures)
    cAutoControl(endingPoint, startAngle, endAngle, curvatureA = 1 / 3, curvatureB = curvatureA) {
        const startingPoint = this.currentPosition;
        const absoluteEndPoint = startingPoint.add(endingPoint);
        let startDirection = null;
        if (startAngle !== undefined) {
            startDirection = Vector2D.of(Math.cos(startAngle), Math.sin(startAngle));
        }
        else {
            const lastCommand = this.lastCommand;
            if (lastCommand instanceof LineCommand) {
                startDirection = lastCommand.endPoint.unit();
            }
            else if (lastCommand instanceof CubicBezierCurveCommand) {
                const directionVector = lastCommand.endPoint.subtract(lastCommand.secondControlPoint);
                startDirection = directionVector.unit();
            }
            else if (lastCommand instanceof QuadraticBezierCurveCommand) {
                const directionVector = lastCommand.endPoint.subtract(lastCommand.controlPoint);
                startDirection = directionVector.unit();
            }
        }
        let endDirection = null;
        if (endAngle !== undefined) {
            endDirection = Vector2D.of(Math.cos(endAngle), Math.sin(endAngle));
        }
        const { firstControlPoint, secondControlPoint } = cubicBezierAutoControl(startingPoint, absoluteEndPoint, startDirection ?? undefined, endDirection ?? undefined, curvatureA, curvatureB);
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, absoluteEndPoint);
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPointVector, secondControlPointVector, endPointVector, 'relative'));
        return this;
    }
    CAutoControl(endingPoint, startAngle, endAngle, curvatureA = 1 / 3, curvatureB = curvatureA) {
        const startingPoint = this.currentPosition;
        let startDirection = null;
        if (startAngle !== undefined) {
            startDirection = Vector2D.of(Math.cos(startAngle), Math.sin(startAngle));
        }
        else {
            const lastCommand = this.lastCommand;
            if (lastCommand instanceof LineCommand) {
                startDirection = lastCommand.endPoint.unit();
            }
            else if (lastCommand instanceof CubicBezierCurveCommand) {
                const directionVector = lastCommand.endPoint.subtract(lastCommand.secondControlPoint);
                startDirection = directionVector.unit();
            }
            else if (lastCommand instanceof QuadraticBezierCurveCommand) {
                const directionVector = lastCommand.endPoint.subtract(lastCommand.controlPoint);
                startDirection = directionVector.unit();
            }
        }
        let endDirection = null;
        if (endAngle !== undefined) {
            endDirection = Vector2D.of(Math.cos(endAngle), Math.sin(endAngle));
        }
        const { firstControlPoint, secondControlPoint } = cubicBezierAutoControl(startingPoint, endingPoint, startDirection ?? undefined, endDirection ?? undefined, curvatureA, curvatureB);
        const firstControlPointVector = Vector2D.from(startingPoint, firstControlPoint);
        const secondControlPointVector = Vector2D.from(startingPoint, secondControlPoint);
        const endPointVector = Vector2D.from(startingPoint, endingPoint);
        this.commands.push(new CubicBezierCurveCommand(startingPoint, firstControlPointVector, secondControlPointVector, endPointVector, 'absolute'));
        return this;
    }
    z() {
        this.commands.push(new ClosePathCommand(this.openPathStack.pop(), 'relative'));
        return this;
    }
    toPath() {
        return new Path(this.commands);
    }
    toString() {
        return this.toPath().toString();
    }
}
;
