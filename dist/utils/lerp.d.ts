type Range = readonly [number, number];
type Path = readonly [number, number, ...number[]];
export declare function lerp(value: number, currentScaleMin: number, currentScaleMax: number, newScaleMin?: number, newScaleMax?: number): number;
export declare function clampedLerp(value: number, currentScaleMin: number, currentScaleMax: number, newScaleMin?: number, newScaleMax?: number): number;
export declare function batchedLerp<K extends string>(t: number, inputRange: Range, outputBatch: Record<K, Range>): Record<K, number>;
export declare function lerpPath<T extends Path>(value: number, inputPath: T extends readonly [infer A, infer B, ...infer R] ? [
    A extends number ? number : never,
    B extends number ? number : never,
    ...R
] : never, outputPath: T): number;
export declare function batchedLerpPath<T extends Path, K extends string>(t: number, inputPath: T, outputBatch: Record<K, [...T]>): Record<K, number>;
export type Interpolator<S extends keyof any> = {
    position: number;
    (inputRange: Range, outputRange: Range): number;
    lerp(inputRange: Range, outputRange: Range): number;
    clamped(inputRange: Range, outputRange: Range): number;
    batched<K extends string>(inputRange: Range, batch: Record<K, Range>): Record<K, number>;
    path<T extends Path>(inputRange: T extends readonly [infer A, infer B, ...infer R] ? [
        A extends number ? number : never,
        B extends number ? number : never,
        ...R
    ] : never, outputRange: T): number;
    pathBatched<T extends Path, K extends string>(inputRange: T, batch: Record<K, [...T]>): Record<K, number>;
} & Record<S, {
    (outputRange: Range): number;
    lerp(outputRange: Range): number;
    clamped(outputRange: Range): number;
    parent: Interpolator<S>;
    segment: Range;
}>;
export declare function interpolator<S extends keyof any | never = never>(t: number, segments?: Record<S, Range>): Interpolator<S>;
export {};
