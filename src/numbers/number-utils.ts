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