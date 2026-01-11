import {round} from "./utils/index";
import {Vector2D} from "./vector2D";
import {Point2D} from "./point2D";

function coordinates(point: Point2D | Vector2D) {
    return `${round(point.x, 4)} ${round(point.y, 4)}`;
}

export abstract class PrimitiveCommand {
    public abstract getKey(): string;
    public abstract toString(): string;
}

export abstract class MovePrimitive extends PrimitiveCommand {
    protected abstract getEndingPoint(): Point2D | Vector2D;

    public toString() {
        return `${this.getKey()} ${coordinates(this.getEndingPoint())}`;
    }
}

export class AbsoluteMovePrimitive extends MovePrimitive {
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

export class RelativeMovePrimitive extends MovePrimitive {
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

export abstract class LinePrimitive extends PrimitiveCommand {
    protected abstract getEndingPoint(): Point2D | Vector2D;

    public toString() {
        const cmd = this.getKey();
        const end = coordinates(this.getEndingPoint());
        return `${cmd} ${end}`;
    }
}

export class AbsoluteLinePrimitive extends LinePrimitive {
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

export class RelativeLinePrimitive extends LinePrimitive {
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

export abstract class QuadraticBezierCurvePrimitive extends PrimitiveCommand {
    protected abstract getControlPoint(): Point2D | Vector2D;
    protected abstract getEndingPoint(): Point2D | Vector2D;

    public toString() {
        const cmd = this.getKey();
        const cp = coordinates(this.getControlPoint());
        const ep = coordinates(this.getEndingPoint());
        return `${cmd} ${cp} ${ep}`;
    }
}

export class AbsoluteQuadraticBezierCurvePrimitive extends QuadraticBezierCurvePrimitive {
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
export class RelativeQuadraticBezierCurvePrimitive extends QuadraticBezierCurvePrimitive {
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

export abstract class CubicBezierCurvePrimitive extends PrimitiveCommand {
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

export class AbsoluteCubicBezierCurvePrimitive extends CubicBezierCurvePrimitive {
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

export class RelativeCubicBezierCurvePrimitive extends CubicBezierCurvePrimitive {
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

export abstract class EllipticalArcPrimitive extends PrimitiveCommand {
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

export class AbsoluteEllipticalArcPrimitive extends EllipticalArcPrimitive {
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

export class RelativeEllipticalArcPrimitive extends EllipticalArcPrimitive {
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

export class AbsoluteClosePathPrimitive extends PrimitiveCommand {
    public getKey(): string {
        return "Z";
    }

    public toString() {
        return this.getKey();
    }
}

export class RelativeClosePathPrimitive extends PrimitiveCommand {
    public getKey(): string {
        return "z";
    }

    public toString() {
        return this.getKey();
    }
}

export class SVGPath {
    constructor(readonly commands: PrimitiveCommand[]) { }

    public toString() {
        return this.commands.map(c => c.toString()).join(' ');
    }
}