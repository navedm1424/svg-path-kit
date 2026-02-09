import {round} from "./numbers/index";
import {Vector2D} from "./vector2D";
import {Point2D} from "./point2D";
import {makePropertiesReadonly} from "./utils/object-utils";

function coordinates(point: Point2D | Vector2D) {
    return `${round(point.x, 4)} ${round(point.y, 4)}`;
}

/** Base SVG primitive command. */
export abstract class PrimitiveCommand {
    /** Single-letter SVG command key. */
    public abstract getKey(): string;
    /** Serialize the command to SVG path syntax. */
    public abstract toString(): string;
}

/** Base class for move commands. */
export abstract class MovePrimitive extends PrimitiveCommand {
    protected abstract getEndingPoint(): Point2D | Vector2D;

    public toString() {
        return `${this.getKey()} ${coordinates(this.getEndingPoint())}`;
    }
}

/** Absolute move-to (M). */
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

/** Relative move-to (m). */
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

/** Base class for line commands. */
export abstract class LinePrimitive extends PrimitiveCommand {
    protected abstract getEndingPoint(): Point2D | Vector2D;

    public toString() {
        const cmd = this.getKey();
        const end = coordinates(this.getEndingPoint());
        return `${cmd} ${end}`;
    }
}

/** Absolute line-to (L). */
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

/** Relative line-to (l). */
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

/** Base class for quadratic Bézier commands. */
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

/** Absolute quadratic Bézier (Q). */
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
/** Relative quadratic Bézier (q). */
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

/** Base class for cubic Bézier commands. */
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

/** Absolute cubic Bézier (C). */
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

/** Relative cubic Bézier (c). */
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

/** Base class for elliptical arc commands. */
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
        return `${this.getKey()} ${this.xRadius} ${this.yRadius} ${round(this.xAxisRotation, 4)} ${this.largeArcFlag} ${this.sweepFlag} ${ep}`;
    }
}

/** Absolute elliptical arc (A). */
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

/** Relative elliptical arc (a). */
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

/** Absolute close-path (Z). */
export class AbsoluteClosePathPrimitive extends PrimitiveCommand {
    public getKey(): string {
        return "Z";
    }

    public toString() {
        return this.getKey();
    }
}

/** Relative close-path (z). */
export class RelativeClosePathPrimitive extends PrimitiveCommand {
    public getKey(): string {
        return "z";
    }

    public toString() {
        return this.getKey();
    }
}

export class SVGPath {
    readonly commands: readonly PrimitiveCommand[];
    constructor(commands: PrimitiveCommand[]) {
        this.commands = Object.freeze([...commands]);
        makePropertiesReadonly(this, "commands");
    }

    public toString() {
        return this.commands.map(c => c.toString()).join(' ');
    }
}