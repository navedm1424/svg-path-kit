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

export type RoundingStrategy = "round" | "floor" | "ceil" | "trunc";

/**
 * Round `num` to the nearest multiple of `step` (default `1`, i.e. the nearest integer).
 * Pass a `step` like `1e-4` to round to the nearest ten-thousandth, or `5` to round to the
 * nearest multiple of 5. `strategy` selects which `Math` rounding function to snap with.
 */
export function round(num: number, step: number = 1, strategy: RoundingStrategy = "round"): number {
    return Math[strategy](num / step) * step;
}

const equalityThreshold = 1e-8;

/**
 * Find roots of a function within `tStart` and `tEnd` using adaptive stepping and bisection.
 */
export function findRoots(f: (t: number) => number, tStart: number, tEnd: number) {
    if (!Number.isFinite(tStart) || !Number.isFinite(tEnd))
        throw Error("invalid arguments.");

    const roots: number[] = [];

    let tCurr = tStart, vCurr = f(tCurr);
    if (Math.abs(vCurr) < equalityThreshold)
        roots.push(tCurr);
    const eps = 1e-4;
    let currSpeed = (f(tCurr + eps) - f(tCurr - eps)) / (2 * eps);

    while (Math.abs(tEnd - tCurr) >= equalityThreshold) {
        const dt = clamp(0.1 / Math.abs(currSpeed), eps, 0.1);
        let tNext = tCurr + dt;
        if (tNext > tEnd)
            tNext = tEnd;
        const vNext = f(tNext);
        const nextSpeed = (f(tNext + eps) - f(tNext - eps)) / (2 * eps);
        if (Math.abs(vNext - vCurr) >= equalityThreshold && Math.abs(vNext) < equalityThreshold) {
            roots.push(tNext);
        } else if (
            vCurr * vNext < 0
            || (
                currSpeed * nextSpeed < 0
                && (Math.abs(vCurr) <= 0.1 || Math.abs(vNext) <= 0.1)
            )
        ) {
            // bisection
            let a = tCurr, b = tNext;
            let fa = vCurr, fb = vNext;
            let root = (a + b) / 2;
            for (let j = 0; j < 50; j++) {
                root = (a + b) / 2;
                const fr = f(root);
                if (Math.abs(fr) < equalityThreshold) break;
                if (fa * fr <= 0) { b = root; fb = fr; }
                else { a = root; fa = fr; }
            }
            roots.push(root);
        }

        tCurr = tNext; vCurr = vNext; currSpeed = nextSpeed;
    }
    return roots;
}