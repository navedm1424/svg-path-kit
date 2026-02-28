import {clamp, saturate} from "./number-utils.js";

export function round(num: number, decimalPlaces: number = 0): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
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

export function lerp(
    start: number,
    end: number,
    t: number
) {
    return clamp(start + (end - start) * t, start, end);
}

export function invLerp(
    start: number,
    end: number,
    v: number
) {
    return saturate((v - start) / (end - start));
}

export function remap(
    value: number,
    currentStart: number,
    currentEnd: number,
    newStart: number,
    newEnd: number
) {
    if (currentStart === newStart && currentEnd === newEnd)
        return value;
    if (value <= currentStart)
        return newStart;
    if (value >= currentEnd)
        return newEnd;

    // same as lerp(newStart, newEnd, invLerp(currentStart, currentEnd, value))
    return (
        newStart + (newEnd - newStart) * ((value - currentStart) / (currentEnd - currentStart))
    );
}