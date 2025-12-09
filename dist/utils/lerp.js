import { clamp } from "./math";
export function lerp(value, currentScaleMin, currentScaleMax, newScaleMin = 0, newScaleMax = 1) {
    const standardNormalization = (value - currentScaleMin) / (currentScaleMax - currentScaleMin);
    return ((newScaleMax - newScaleMin) * standardNormalization + newScaleMin);
}
;
export function clampedLerp(value, currentScaleMin, currentScaleMax, newScaleMin = 0, newScaleMax = 1) {
    if (value <= currentScaleMin)
        return newScaleMin;
    if (value >= currentScaleMax)
        return newScaleMax;
    return clamp(lerp(value, currentScaleMin, currentScaleMax, newScaleMin, newScaleMax), newScaleMin, newScaleMax);
}
;
export function batchedLerp(t, inputRange, outputBatch) {
    if (t <= inputRange[0])
        return Object.keys(outputBatch).reduce((acc, cur) => {
            acc[cur] = outputBatch[cur][0];
            return acc;
        }, {});
    if (t >= inputRange[inputRange.length - 1])
        return Object.keys(outputBatch).reduce((acc, cur) => {
            const newScale = outputBatch[cur];
            acc[cur] = newScale[newScale.length - 1];
            return acc;
        }, {});
    return Object.keys(outputBatch).reduce((acc, cur) => {
        const newScale = outputBatch[cur];
        acc[cur] = clampedLerp(t, inputRange[0], inputRange[1], newScale[0], newScale[1]);
        return acc;
    }, {});
}
;
export function lerpPath(value, inputPath, outputPath) {
    if (value <= inputPath[0])
        return outputPath[0];
    if (value >= inputPath[inputPath.length - 1])
        return outputPath[outputPath.length - 1];
    for (let i = 0; i < inputPath.length - 1; i++) {
        if (inputPath[i] < value && value < inputPath[i + 1]) {
            return clampedLerp(value, inputPath[i], inputPath[i + 1], outputPath[i], outputPath[i + 1]);
        }
    }
    return 0;
}
;
export function batchedLerpPath(t, inputPath, outputBatch) {
    if (t <= inputPath[0])
        return Object.keys(outputBatch).reduce((acc, cur) => {
            acc[cur] = outputBatch[cur][0];
            return acc;
        }, {});
    if (t >= inputPath[inputPath.length - 1])
        return Object.keys(outputBatch).reduce((acc, cur) => {
            const newScale = outputBatch[cur];
            acc[cur] = newScale[newScale.length - 1];
            return acc;
        }, {});
    let minIndex = 0;
    let maxIndex = 0;
    for (let i = 0; i < inputPath.length - 1; i++) {
        if (inputPath[i] < t && t < inputPath[i + 1]) {
            minIndex = i;
            maxIndex = i + 1;
        }
    }
    return Object.keys(outputBatch).reduce((acc, cur) => {
        const newScale = outputBatch[cur];
        acc[cur] = clampedLerp(t, inputPath[minIndex], inputPath[maxIndex], newScale[minIndex], newScale[maxIndex]);
        return acc;
    }, {});
}
;
export function interpolator(t, segments) {
    const interpolator = function (inputRange, outputRange) {
        return this.clamped(inputRange, outputRange);
    };
    interpolator.position = t;
    interpolator.lerp = function (inputRange, outputRange) {
        return lerp(this.position, ...inputRange, ...outputRange);
    };
    interpolator.clamped = function (inputRange, outputRange) {
        return clampedLerp(this.position, ...inputRange, ...outputRange);
    };
    interpolator.batched = function (inputRange, batch) {
        return batchedLerp(this.position, inputRange, batch);
    };
    interpolator.path = function (inputRange, outputRange) {
        return lerpPath(this.position, inputRange, outputRange);
    };
    interpolator.pathBatched = function (inputRange, batch) {
        return batchedLerpPath(this.position, inputRange, batch);
    };
    if (!segments)
        return interpolator;
    const segmentKeys = Object.keys(segments);
    for (const segmentKey of segmentKeys) {
        const segment = segments[segmentKey];
        const segmentInterpolator = function (outputRange) {
            return this[segmentKey].clamped(outputRange);
        };
        segmentInterpolator.parent = interpolator;
        segmentInterpolator.segment = segment;
        segmentInterpolator.lerp = function (outputRange) {
            return this.parent.lerp(this.segment, outputRange);
        };
        segmentInterpolator.clamped = function (outputRange) {
            return this.parent.clamped(this.segment, outputRange);
        };
        interpolator[segmentKey] = segmentInterpolator;
    }
    ;
    return interpolator;
}
;
