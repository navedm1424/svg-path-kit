import {remap, saturate} from "../numbers/index";
import {assignReadonlyProperties, makePropertiesReadonly} from "../utils/object-utils";

export class Segment {
    readonly start: number;
    readonly end: number;
    readonly duration: number;

    constructor(start: number, end: number) {
        if (start > end)
            [start, end] = [end, start];
        this.start = saturate(start);
        this.end = saturate(end);
        this.duration = this.end - this.start;
        makePropertiesReadonly(this, "start", "end", "duration");
    }
    public static from(start: number) {
        return {
            to(end: number) {
                return new Segment(start, end);
            },
            ofDuration(duration: number) {
                return new Segment(start, start + duration);
            }
        };
    }
}

type DoComputeSubarray<
    Remaining extends any[],
    From extends number | any,
    To extends number | any,
    I extends null[] = [],
    Output extends any[] = [],
    Include extends boolean = false
> = 0 extends Remaining["length"]
    ? Output
    : To extends I["length"] | Remaining[0]
        ? Include extends true
            ? [...Output, Remaining[0]]
            : Output
        : Remaining extends [infer H, ...infer Tail]
            ? Include extends true
                ? DoComputeSubarray<Tail, From, To, [...I, null], [...Output, H], true>
                : From extends I["length"] | H
                    ? DoComputeSubarray<Tail, From, To, [...I, null], [...Output, H], true>
                    : DoComputeSubarray<Tail, From, To, [...I, null], Output>
            : Output;

type StrToNum<S extends string> = S extends `${infer N extends number}` ? N : never;

type TupleIndex<T extends readonly unknown[]> =
    number extends T['length']
        ? number
        : StrToNum<Exclude<keyof T, keyof any[]> & string>;

type ZeroIfNegative<N extends number> = `${N}` extends `-${number}` ? 0 : N;

type ComputeSubarray<
    Full extends any[],
    From extends number | any,
    To extends number | any
> = To extends number
    ? `${To}` extends `-${number}`
        ? []
        : From extends To
            ? ZeroIfNegative<From> extends TupleIndex<Full>
                ? [Full[ZeroIfNegative<From>]]
                : []
            : DoComputeSubarray<Full,
                From extends number ? ZeroIfNegative<From> : From,
                To extends TupleIndex<Full> ? To : LengthMinusOne<Full>>
    : DoComputeSubarray<Full, From, To>;

type LengthMinusOne<L extends any[]> = string[] extends L ? number : L extends [...infer H, string] ? H["length"] : number;

type Subsequence<S extends string[], Start extends number | S[number] = 0, End extends number | S[number] = LengthMinusOne<S>> =
    string[] extends S ? Sequence<S> : Sequence<ComputeSubarray<S, Start, End>>;

export type Sequence<S extends string[]> = {
    readonly length: S["length"] extends number ? S["length"] : number;
    readonly segmentNames: unknown extends S[number] ? readonly string[] : readonly S[number][];
    readonly start: number;
    readonly end: number;
    subsequence<From extends number | S[number] = 0, To extends number | S[number] = LengthMinusOne<S>>(
        from?: From, to?: To
    ): Subsequence<S, From, To>;
    toArray(): Segment[];
} & {
    readonly [key: number]: Segment;
} & (string[] extends S ? {
    readonly [key: string]: unknown;
} : {
    readonly [K in S[number]]: Segment;
});

class AuthorizedSequence<S extends string[]> {
    readonly #brand = true;
    readonly length: S["length"] extends number ? S["length"] : number;
    readonly segmentNames: unknown extends S[number] ? readonly string[] : readonly S[number][];
    readonly [key: number]: Segment;

    constructor(segments: [S[number], Segment][]) {
        this.length = segments.length;
        this.segmentNames = Object.freeze(segments.map(i => i[0]));
        const properties = {
            length: this.length,
            segmentNames: this.segmentNames
        } as {
            [K in keyof this]?: this[K]
        };

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i]!;
            (properties as any)[segment[0]] = segment[1] as Sequence<S>[S[number]];
            (properties as any)[i] = segment[1];
        }

        assignReadonlyProperties(this, properties);
    }

    get start() {
        return this[0]!.start;
    }
    get end() {
        return this[this.length - 1]!.end;
    }
    subsequence<From extends number | string, To extends number | string>(
        from: From = 0 as From, to: To = this.length - 1 as To
    ) {
        const output: [string, Segment][] = [];
        const segmentNames = this.segmentNames;
        let startPushing = false;
        if (typeof from === "number" && typeof to === "number") {
            if (to < from)
                return new AuthorizedSequence(output);
            if (Object.is(from, to) && from >= 0 && from < segmentNames.length) {
                const segmentName = segmentNames[from]!;
                output.push([segmentName, (this as any)[segmentName] as Segment]);
                return new AuthorizedSequence(output);
            }
        }
        if (typeof from === "number") {
            if (from > segmentNames.length - 1)
                return new AuthorizedSequence(output);
            if (from < 0)
                from = 0 as From;
        }
        if (typeof to === "number") {
            if (to < 0)
                return new AuthorizedSequence(output);
            if (to > segmentNames.length - 1)
                to = segmentNames.length - 1 as To;
        }

        for (let i = typeof from === "number" ? from : 0; i < segmentNames.length; i++) {
            const segmentName = segmentNames[i]!;
            if (Object.is(to, i) || Object.is(to, segmentName)) {
                if (startPushing) output.push([segmentName, (this as any)[segmentName] as Segment]);
                break;
            }
            if (startPushing || Object.is(from, i) || Object.is(from, segmentName)) {
                startPushing = true;
                output.push([segmentName, (this as any)[segmentName] as Segment]);
            }
        }

        return new AuthorizedSequence(output);
    }
    toArray() {
        const result: Segment[] = [];
        for (let i = 0; i < this.length; i++) {
            result[i] = this[i]!;
        }
        return result;
    }
    static [Symbol.hasInstance](value: any): value is AuthorizedSequence<any> {
        return #brand in value && value.#brand;
    }
}

Object.defineProperty(AuthorizedSequence.prototype, "constructor", {
    value: undefined,
    writable: false,
    configurable: false
});

export const Sequence = Object.freeze({
    fromSegments<S extends string[]>(...segments: { [K in keyof S]: [S[K], number] }) {
        return {
            scaleToRange(start: number, end: number): Sequence<S> {
                start = saturate(start);
                end = saturate(end);
                const sequence: [string, Segment][] = [];
                let totalTime = segments.reduce(
                    (acc, cur) => acc + cur[1], 0
                );
                let currentTime = 0;
                for (let i = 0; i < segments.length; i++) {
                    const interval = segments[i]!;
                    const name = interval[0];
                    const duration = Math.abs(interval[1]);
                    sequence[i] = [
                        name,
                        Segment.from(remap(currentTime, 0, totalTime, start, end))
                            .ofDuration(remap(duration, 0, totalTime, start, end))
                    ];
                    currentTime += duration;
                }
                return new AuthorizedSequence(sequence) as unknown as Sequence<S>;
            }
        };
    },
    [Symbol.hasInstance](object: any): object is Sequence<any> {
        return object instanceof AuthorizedSequence;
    }
});