import {round} from "../utils/math";
import {Vector2D} from "./vector2D";
import {Point2D} from "./point2D";

function coordinates(point: Point2D | Vector2D) {
    return `${round(point.x, 4)} ${round(point.y, 4)}`;
}

export abstract class SVGPathCommand {
    public abstract getKey(): string;
    public abstract toString(): string;
}

export abstract class MoveCommand extends SVGPathCommand {
    protected abstract getEndingPoint(): Point2D | Vector2D;

    public toString() {
        return `${this.getKey()} ${coordinates(this.getEndingPoint())}`;
    }
}

export class AbsoluteMoveCommand extends MoveCommand {
    constructor(readonly endingPoint: Point2D) {
        super();
    }

    public getKey() {
        return "M";
    }
    protected getEndingPoint(): Point2D | Vector2D {
        return this.endingPoint;
    }
}

export class RelativeMoveCommand extends MoveCommand {
    constructor(readonly endingPoint: Vector2D) {
        super();
    }

    public getKey() {
        return "m";
    }
    public getEndingPoint(): Point2D | Vector2D {
        return this.endingPoint;
    }
}

export abstract class LineCommand extends SVGPathCommand {
    protected abstract getEndingPoint(): Point2D | Vector2D;

    public toString() {
        const cmd = this.getKey();
        const end = coordinates(this.getEndingPoint());
        return `${cmd} ${end}`;
    }
}

export class AbsoluteLineCommand extends LineCommand {
    constructor(readonly endingPoint: Point2D) {
        super();
    }

    public getKey() {
        return "L";
    }
    protected getEndingPoint(): Point2D | Vector2D {
        return this.endingPoint;
    }
}

export class RelativeLineCommand extends LineCommand {
    constructor(readonly endingPoint: Vector2D) {
        super();
    }

    public getKey() {
        return "l";
    }
    protected getEndingPoint(): Point2D | Vector2D {
        return this.endingPoint;
    }
}

export abstract class QuadraticBezierCurveCommand extends SVGPathCommand {
    protected abstract getControlPoint(): Point2D | Vector2D;
    protected abstract getEndingPoint(): Point2D | Vector2D;

    public toString() {
        const cmd = this.getKey();
        const cp = coordinates(this.getControlPoint());
        const ep = coordinates(this.getEndingPoint());
        return `${cmd} ${cp} ${ep}`;
    }
}

export class AbsoluteQuadraticBezierCurveCommand extends QuadraticBezierCurveCommand {
    constructor(
        readonly controlPoint: Point2D,
        readonly endingPoint: Point2D
    ) {
        super();
    }
    public getKey() {
        return 'Q';
    }
    protected getControlPoint(): Point2D | Vector2D {
        return this.controlPoint;
    }
    protected getEndingPoint(): Point2D | Vector2D {
        return this.endingPoint;
    }
}
export class RelativeQuadraticBezierCurveCommand extends QuadraticBezierCurveCommand {
    constructor(
        readonly controlPoint: Vector2D,
        readonly endingPoint: Vector2D
    ) {
        super();
    }
    public getKey() {
        return "q";
    }
    protected getControlPoint(): Point2D | Vector2D {
        return this.controlPoint;
    }
    protected getEndingPoint(): Point2D | Vector2D {
        return this.endingPoint;
    }
}

export abstract class CubicBezierCurveCommand extends SVGPathCommand {
    protected abstract getFirstControlPoint(): Point2D | Vector2D;
    protected abstract getSecondControlPoint(): Point2D | Vector2D;
    protected abstract getEndingPoint(): Point2D | Vector2D;

    public toString() {
        const cp1 = coordinates(this.getFirstControlPoint());
        const cp2 = coordinates(this.getSecondControlPoint());
        const ep = coordinates(this.getEndingPoint());
        return `${(this.getKey())} ${cp1} ${cp2} ${ep}`;
    }
}

export class AbsoluteCubicBezierCurveCommand extends CubicBezierCurveCommand {
    constructor(
        readonly firstControlPoint: Point2D,
        readonly secondControlPoint: Point2D,
        readonly endingPoint: Point2D
    ) {
        super();
    }
    public getKey() {
        return "C";
    }

    protected getFirstControlPoint(): Point2D | Vector2D {
        return this.firstControlPoint;
    }
    protected getSecondControlPoint(): Point2D | Vector2D {
        return this.secondControlPoint;
    }
    protected getEndingPoint(): Point2D | Vector2D {
        return this.endingPoint;
    }
}

export class RelativeCubicBezierCurveCommand extends CubicBezierCurveCommand {
    constructor(
        readonly firstControlPoint: Vector2D,
        readonly secondControlPoint: Vector2D,
        readonly endingPoint: Vector2D
    ) {
        super();
    }
    public getKey() {
        return "c";
    }

    protected getFirstControlPoint(): Point2D | Vector2D {
        return this.firstControlPoint;
    }
    protected getSecondControlPoint(): Point2D | Vector2D {
        return this.secondControlPoint;
    }
    protected getEndingPoint(): Point2D | Vector2D {
        return this.endingPoint;
    }
}

export abstract class EllipticalArcCommand extends SVGPathCommand {
    protected constructor(
        readonly xRadius: number,
        readonly yRadius: number,
        readonly xAxisRotation: number,
        readonly largeArcFlag: 0 | 1,
        readonly sweepFlag: 0 | 1,
    ) {
        super();
    }
    protected abstract getEndingPoint(): Point2D | Vector2D;

    public toString() {
        const ep = coordinates(this.getEndingPoint());
        return `${this.getKey()} ${this.xRadius} ${this.yRadius} ${this.xAxisRotation} ${this.largeArcFlag} ${this.sweepFlag} ${ep}`;
    }
}

export class AbsoluteEllipticalArcCommand extends EllipticalArcCommand {
    constructor(
        xRadius: number,
        yRadius: number,
        xAxisRotation: number,
        largeArcFlag: 0 | 1,
        sweepFlag: 0 | 1,
        readonly endingPoint: Point2D
    ) {
        super(xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag);
    }

    public getKey(): string {
        return 'A';
    }
    protected getEndingPoint() {
        return this.endingPoint;
    }
}

export class RelativeEllipticalArcCommand extends EllipticalArcCommand {
    constructor(
        xRadius: number,
        yRadius: number,
        xAxisRotation: number,
        largeArcFlag: 0 | 1,
        sweepFlag: 0 | 1,
        readonly endingPoint: Vector2D
    ) {
        super(xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag);
    }

    public getKey() {
        return 'a';
    }
    protected getEndingPoint() {
        return this.endingPoint;
    }
}

export class RelativeClosePathCommand extends SVGPathCommand {
    public getKey(): string {
        return "z";
    }

    public toString() {
        return this.getKey();
    }
}

export class SVGPath {
    constructor(readonly commands: SVGPathCommand[]) { }

    public toString() {
        return this.commands.map(c => c.toString()).join(' ');
    }
}