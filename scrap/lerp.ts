import { clamp } from "../src/numbers/math-utils";

type Range = readonly [number, number];
type Path = readonly [number, number, ...number[]];

/**
 * Map a value from one numeric range to another.
 */
export function lerp(
    value: number,
    currentScaleMin: number,
    currentScaleMax: number,
    newScaleMin = 0,
    newScaleMax = 1
) {
    const standardNormalization = (value - currentScaleMin) / (currentScaleMax - currentScaleMin);

    return (
        (newScaleMax - newScaleMin) * standardNormalization + newScaleMin
    );
}

/**
 * Range-map a value and clamp the result to the target range.
 */
export function clampedLerp(
    value: number,
    currentScaleMin: number,
    currentScaleMax: number,
    newScaleMin = 0,
    newScaleMax = 1
) {
    if (value <= currentScaleMin)
        return newScaleMin;
    if (value >= currentScaleMax)
        return newScaleMax;

    return clamp(
        lerp(
            value,
            currentScaleMin,
            currentScaleMax,
            newScaleMin,
            newScaleMax
        ),
        newScaleMin,
        newScaleMax
    );
}

/**
 * Apply clamped linear interpolation to multiple named ranges at once.
 */
export function batchedLerp<K extends string>(
    t: number, inputRange: Range,
    outputBatch: Record<K, Range>
): Record<K, number> {
    if (t <= inputRange[0])
        return Object.keys(outputBatch).reduce((acc, cur) => {
            acc[cur as K] = outputBatch[cur as K][0];
            return acc;
        }, {} as Record<K, number>);
    if (t >= inputRange[inputRange.length - 1])
        return Object.keys(outputBatch).reduce((acc, cur) => {
            const newScale = outputBatch[cur as K];
            acc[cur as K] = newScale[newScale.length - 1];
            return acc;
        }, {} as Record<K, number>);

    return Object.keys(outputBatch).reduce((acc, cur) => {
        const newScale = outputBatch[cur as K];
        acc[cur as K] = clampedLerp(
            t, inputRange[0], inputRange[1],
            newScale[0], newScale[1]
        );
        return acc;
    }, {} as Record<K, number>);
}

/**
 * Interpolate along a polyline of input/output points.
 */
export function lerpPath<
    T extends Path
>(
    value: number,
    inputPath: T extends readonly [infer A, infer B, ...infer R] ? [
        A extends number ? number : never,
        B extends number ? number : never,
        ...R
    ] : never,
    outputPath: T
) {
    if (value <= inputPath[0])
        return outputPath[0];
    if (value >= inputPath[inputPath.length - 1])
        return outputPath[outputPath.length - 1];

    for (let i = 0; i < inputPath.length - 1; i++) {
        if (inputPath[i] < value && value < inputPath[i + 1]) {
            return clampedLerp(
                value, inputPath[i], inputPath[i + 1],
                outputPath[i], outputPath[i + 1]
            );
        }
    }

    return 0;
}

/**
 * Batch variant of {@link lerpPath} that interpolates multiple outputs in one call.
 */
export function batchedLerpPath<
    T extends Path,
    K extends string
>(
    t: number, inputPath: T,
    outputBatch: Record<K, [...T]>
) {
    if (t <= inputPath[0])
        return Object.keys(outputBatch).reduce((acc, cur) => {
            acc[cur as K] = outputBatch[cur as K][0];
            return acc;
        }, {} as Record<K, number>);
    if (t >= inputPath[inputPath.length - 1])
        return Object.keys(outputBatch).reduce((acc, cur) => {
            const newScale = outputBatch[cur as K];
            acc[cur as K] = newScale[newScale.length - 1];
            return acc;
        }, {} as Record<K, number>);

    let minIndex = 0;
    let maxIndex = 0;
    for (let i = 0; i < inputPath.length - 1; i++) {
        if (inputPath[i] < t && t < inputPath[i + 1]) {
            minIndex = i;
            maxIndex = i + 1;
        }
    }
    return Object.keys(outputBatch).reduce((acc, cur) => {
        const newScale = outputBatch[cur as K];
        acc[cur as K] = clampedLerp(
            t, inputPath[minIndex], inputPath[maxIndex],
            newScale[minIndex], newScale[maxIndex]
        );
        return acc;
    }, {} as Record<K, number>);
}

export type Interpolator<S extends keyof any> = {
    position: number;
    (inputRange: Range, outputRange: Range): number;
    lerp(inputRange: Range, outputRange: Range): number;
    clamped(inputRange: Range, outputRange: Range): number;
    batched<K extends string>(inputRange: Range, batch: Record<K, Range>): Record<K, number>;
    path<T extends Path>(
        inputRange: T extends readonly [infer A, infer B, ...infer R] ? [
            A extends number ? number : never,
            B extends number ? number : never,
            ...R
        ] : never,
        outputRange: T
    ): number;
    pathBatched<T extends Path, K extends string>(inputRange: T, batch: Record<K, [...T]>): Record<K, number>;
} & Record<S, {
    (outputRange: Range): number;
    lerp(outputRange: Range): number;
    clamped(outputRange: Range): number;
    parent: Interpolator<S>;
    segment: Range;
}>

/**
 * Create an interpolation helper bound to a position `t` with optional named segments.
 */
export function interpolator<S extends keyof any | never = never>(
    t: number, segments?: Record<S, Range>
): Interpolator<S> {
    const interpolator = function (
        this: Interpolator<S>,
        inputRange: Range,
        outputRange: Range
    ) {
        return this.clamped(
            inputRange,
            outputRange
        );
    } as Interpolator<S>;
    interpolator.position = t;
    interpolator.lerp = function (
        inputRange: Range,
        outputRange: Range
    ): number {
        return lerp(
            this.position,
            ...inputRange,
            ...outputRange
        );
    };
    interpolator.clamped = function (
        inputRange: Range,
        outputRange: Range
    ): number {
        return clampedLerp(
            this.position,
            ...inputRange,
            ...outputRange
        );
    };
    interpolator.batched = function <K extends string>(
        inputRange: Range,
        batch: Record<K, Range>
    ): Record<K, number> {
        return batchedLerp(
            this.position,
            inputRange,
            batch
        );
    };
    interpolator.path = function <T extends Path>(
        inputRange: T extends readonly [infer A, infer B, ...infer R] ? [
            A extends number ? number : never,
            B extends number ? number : never,
            ...R
        ] : never,
        outputRange: T
    ): number {
        return lerpPath(
            this.position,
            inputRange,
            outputRange
        );
    };
    interpolator.pathBatched = function <
        T extends Path,
        K extends string
    >(
        inputRange: T,
        batch: Record<K, [...T]>
    ): Record<K, number> {
        return batchedLerpPath(
            this.position,
            inputRange,
            batch
        );
    };
    if (!segments)
        return interpolator as Interpolator<S>;

    const segmentKeys = Object.keys(segments) as S[];
    for (const segmentKey of segmentKeys) {
        const segment: Range = segments[segmentKey];
        const segmentInterpolator = function (this: Interpolator<S>, outputRange: Range) {
            return this[segmentKey].clamped(outputRange);
        } as Interpolator<S>[S];
        segmentInterpolator.parent = interpolator;
        segmentInterpolator.segment = segment;
        segmentInterpolator.lerp = function (outputRange: Range) {
            return this.parent.lerp(this.segment, outputRange);
        };
        segmentInterpolator.clamped = function (outputRange: Range) {
            return this.parent.clamped(this.segment, outputRange);
        };
        interpolator[segmentKey] = segmentInterpolator;
    }
    return interpolator as Interpolator<S>;
}