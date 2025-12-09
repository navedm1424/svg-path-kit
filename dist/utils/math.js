export function round(num, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}
;
export function clamp(value, min = 0, max = 1) {
    if (min > max) {
        [min, max] = [max, min];
    }
    return Math.max(min, Math.min(max, value));
}
;
export function fallbackIfNaN(num, fallback) {
    return num === num ? num : fallback;
}
;
