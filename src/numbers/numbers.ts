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
 * Round `num` to a multiple of `step` (default `1`): `round(x, 1e-4)` snaps to the nearest
 * ten-thousandth, `round(x, 5)` to the nearest multiple of 5. `strategy` picks the `Math`
 * function used to snap.
 */
export function round(num: number, step: number = 1, strategy: RoundingStrategy = "round"): number {
    if (!Number.isFinite(step) || step <= 0)
        throw new RangeError(`step must be a positive finite number, got ${step}.`);
    if (!Number.isFinite(num))
        return num;

    // A fractional step like 1e-4 is inexact in binary, so `k * step` picks up noise
    // (12346 * 1e-4 = 1.2346000000000001). Dividing by the integer reciprocal is correctly rounded.
    const inverse = Math.round(1 / step);
    if (step < 1 && 1 / inverse === step) {
        const scaled = num * inverse;
        // Beyond 2^53 every double is already a whole multiple of the step; nothing to round.
        if (Math.abs(scaled) > Number.MAX_SAFE_INTEGER)
            return num;
        return Math[strategy](scaled) / inverse + (0); // `+ 0` normalizes -0
    }
    return Math[strategy](num / step) * step + (0);
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