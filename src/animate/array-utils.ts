export type Slice<T extends readonly any[], Start extends number | any, End extends number | any> = DoSlice<T, Start, End>;
type DoSlice<
    Remaining extends readonly any[],
    Start extends number | any,
    End extends number | any,
    I extends readonly unknown[] = [],
    Output extends readonly any[] = [],
    Include extends boolean = false
> = End extends I["length"] | Remaining[0]
    ? Output
    : Remaining extends readonly [infer H, ...infer Tail]
        ? Include extends true
            ? DoSlice<Tail, Start, End, [...I, unknown], [...Output, H], true>
            : Start extends I["length"] | H
                ? DoSlice<Tail, Start, End, [...I, unknown], [...Output, H], true>
                : DoSlice<Tail, Start, End, [...I, unknown], Output>
        : Output;

export type TupleIndex<T extends readonly any[]> = Exclude<keyof T, keyof any[]>;

export type MapToType<IL extends readonly any[], OT> = IL extends [any, ...infer Tail] ?
    [OT, ...MapToType<Tail, OT>] : [];