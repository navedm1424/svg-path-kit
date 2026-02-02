export type NumericRange = readonly [number, number];

export function validateRange(range: NumericRange) {
    if (!(
        Array.isArray(range)
        && range.length === 2
        && range.every(n =>
            typeof n === "number"
            && Number.isFinite(n)
        )
    ))
        throw new Error("A numeric range must be an array of exactly two numbers.");
}

export type EasingFunction = (t: number) => number;

export const identity: EasingFunction = t => t;