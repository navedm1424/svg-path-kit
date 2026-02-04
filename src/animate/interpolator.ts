import {invLerp, lerp, remap, saturate} from "../numbers/index";
import {Segment, Timer} from "./timeline";
import {EasingFunction, identity, NumericRange, validateRange} from "./common";

const calcBezier = (t: number, a1: number, a2: number) =>
    (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) * t;
const subdivisionPrecision = 0.0000001;
const subdivisionMaxIterations = 12;

function binarySubdivide(x: number, lowerBound: number, upperBound: number, mX1: number, mX2: number) {
    let currentX;
    let currentT;
    let i = 0;
    do {
        currentT = lowerBound + (upperBound - lowerBound) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - x;
        if (currentX > 0.0) {
            upperBound = currentT;
        }
        else {
            lowerBound = currentT;
        }
    } while (Math.abs(currentX) > subdivisionPrecision && ++i < subdivisionMaxIterations);
    return currentT;
}

export function cubicBezierEasing(mX1: number, mY1: number, mX2: number, mY2: number): EasingFunction {
    mX1 = saturate(mX1);
    mX2 = saturate(mX2);
    // If this is a linear gradient, return linear easing
    if (mX1 === mY1 && mX2 === mY2)
        return identity;
    const getTForX = (aX: number) => binarySubdivide(aX, 0, 1, mX1, mX2);
    // If animation is at start/end, return t without easing
    return t => t === 0 || t === 1 ? t : calcBezier(getTForX(t), mY1, mY2);
}

export const easeIn = cubicBezierEasing(0.42, 0, 1, 1);
export const easeOut = cubicBezierEasing(0, 0, 0.58, 1);
export const easeInOut = cubicBezierEasing(0.42, 0, 0.58, 1);

type InterpolationChain = {
    then(segment: Segment, outputRangeSupplier: (currentOutput: number) => NumericRange): InterpolationChain;
    output(): number;
};
export type Interpolator = {
    readonly timer: Timer;
    (segment: Segment, outputRange: NumericRange): number;
    easeWith(segment: Segment, outputRange: NumericRange, easing: EasingFunction): number;
    easeIn(segment: Segment, outputRange: NumericRange): number;
    easeOut(segment: Segment, outputRange: NumericRange): number;
    easeInOut(segment: Segment, outputRange: NumericRange): number;
    chain(segment: Segment, outputRange: NumericRange): InterpolationChain;
};

export function interpolator(timer: Timer): Interpolator {
    const interpolator = function (segment, outputRange) {
        validateRange(outputRange);
        return remap(
            timer.time,
            segment.start, segment.end,
            ...outputRange
        );
    } as Interpolator;
    Object.defineProperty(interpolator, "timer", {
        value: timer,
        writable: false,
        configurable: false
    });
    interpolator.easeWith = function (segment, outputRange, easing) {
        validateRange(outputRange);
        return lerp(
            ...outputRange,
            easing(invLerp(
                segment.start, segment.end,
                timer.time
            ))
        );
    };
    interpolator.easeIn = function (segment, outputRange) {
        return this.easeWith(segment, outputRange, easeIn);
    };
    interpolator.easeOut = function (segment, outputRange) {
        return this.easeWith(segment, outputRange, easeOut);
    };
    interpolator.easeInOut = function (segment, outputRange) {
        return this.easeWith(segment, outputRange, easeInOut);
    };
    interpolator.chain = function (segment, outputRange) {
        validateRange(outputRange);
        let currentOutput = remap(timer.time, segment.start, segment.end, ...outputRange);
        return {
            then(segment, outputRangeSupplier) {
                const outputRange = outputRangeSupplier(currentOutput);
                validateRange(outputRange);
                currentOutput = remap(timer.time, segment.start, segment.end, ...outputRange);
                return this;
            },
            output() {
                return currentOutput;
            }
        }
    };
    return interpolator as Interpolator;
}