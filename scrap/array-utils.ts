type StrToNum<S extends string> = S extends `${infer N extends number}` ? N : never;

type TupleIndex<T extends readonly unknown[]> =
    number extends T['length']
        ? number
        : StrToNum<Exclude<keyof T, keyof any[]> & string>;

type Pick<
  T extends readonly any[],
  I extends readonly number[]
> = { [K in keyof I]: T[I[K]] };

/**
 * Type-safe helper to grab selected indices from a tuple-like array.
 */
export function pick<
    T extends readonly [any?, ...any[]],
    I extends readonly TupleIndex<T>[]
>(
    array: T, ...indices: I
): Pick<T, I> {
    return indices.map(i => array[i]) as Pick<T, I>;
};