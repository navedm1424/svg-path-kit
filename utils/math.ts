export function round(num: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}

export function clamp(
    value: number,
    min = 0,
    max = 1
) {
    if (min > max) {
        [min, max] = [max, min];
    }

    return Math.max(min, Math.min(max, value));
}

export function ifNaN(num: number, fallback: number) {
    return num === num ? num : fallback;
}

export function ifNegative(num: number, mapper: (num: number) => number) {
    return num < 0 ? mapper(num) : num;
}