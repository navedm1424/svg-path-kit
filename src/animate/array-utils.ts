export type Slice<T extends any[], Start extends number | any, End extends number | any> =
    any[] extends T ? T : DoSlice<T, Start, End>;
type DoSlice<
    Remaining extends any[],
    Start extends number | any,
    End extends number | any,
    I extends null[] = [],
    Output extends any[] = [],
    Include extends boolean = false
> = End extends I["length"] | Remaining[0]
    ? Output
    : Remaining extends [infer H, ...infer Tail]
        ? Include extends true
            ? DoSlice<Tail, Start, End, [...I, null], [...Output, H], true>
            : Start extends I["length"] | H
                ? DoSlice<Tail, Start, End, [...I, null], [...Output, H], true>
                : DoSlice<Tail, Start, End, [...I, null], Output>
        : Output;

export type MapToType<IL extends readonly any[], OT> = IL extends [any, ...infer Tail] ?
    [OT, ...MapToType<Tail, OT>] : [];