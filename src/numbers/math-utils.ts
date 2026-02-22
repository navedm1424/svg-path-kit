import {clamp, saturate} from "./number-utils.js";

/**
 * Round a number to the specified decimal places.
 */
export function round(num: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}

const TWO_PI = 2.0 * Math.PI;
const EPS = 1e-5;

/**
 * Unwrap `theta1` to its equivalent angle closest to `theta0`.
 */
export function continuousAngle(theta0: number, theta1: number): number {
    // unwrap theta1 to be closest to theta0
    let d = theta1 - theta0;
    d = (d + Math.PI) % TWO_PI;
    if (d < 0) d += TWO_PI;
    d -= Math.PI;

    theta1 = theta0 + d;

    // kill near-π numerical flips
    if (Math.abs(Math.abs(theta1 - theta0) - Math.PI) < EPS) {
        theta1 = theta0;
    }

    return theta1;
}

/**
 * Get the base-10 order of magnitude of `n`.
 */
export function orderOfMagnitude(n: number): number {
    if (n === 0) return 0; // zero is a philosophical problem
    return Math.floor(Math.log10(Math.abs(n)));
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