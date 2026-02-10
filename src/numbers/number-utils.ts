/**
 * Clamp `value` to the `[min, max]` range.
 */
export function clamp(
    v: number,
    min: number,
    max: number
) {
    if (min > max)
        [min, max] = [max, min];

    if (v > max)
        return max;
    if (v < min)
        return min;
    return v;
}

export function saturate(v: number) {
    if (v > 1)
        return 1;
    if (v < 0)
        return 0;
    return v;
}

/**
 * Return `fallback` when `num` is NaN.
 */
export function ifNaN(num: number, fallback: number) {
    return num === num ? num : fallback;
}

/**
 * Map negative values through `mapper`; return the original otherwise.
 */
export function ifNegative(num: number, mapper: (num: number) => number) {
    return num < 0 ? mapper(num) : num;
}