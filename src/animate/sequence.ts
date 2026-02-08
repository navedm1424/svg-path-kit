import {remap, saturate} from "../numbers/index";
import {makePropertiesReadonly} from "../object-utils";

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
// type TupleIndex<T extends any[]> = Exclude<keyof T, keyof any[]>;
type ConstructSubarray<
    Full extends any[],
    Start extends number | any,
    End extends number | any,
    Remaining extends any[] = Full,
    I extends null[] = [],
    Output extends any[] = [],
    Include extends boolean = false
> = 0 extends Remaining["length"]
    ? Output
    : End extends I["length"] | Remaining[0]
        ? Include extends true
            ? [...Output, Remaining[0]]
            : Output
        : Remaining extends [infer H, ...infer Tail]
            ? Include extends true
                ? ConstructSubarray<Full, Start, End, Tail, [...I, null], [...Output, H], true>
                : Start extends I["length"] | H
                    ? ConstructSubarray<Full, Start, End, Tail, [...I, null], [...Output, H], true>
                    : ConstructSubarray<Full, Start, End, Tail, [...I, null], Output>
            : Output;

// type ZeroIfNegative<N extends number> = Sign<N> extends -1 ? 0 : N;
// type Sign<N extends number> =
//     `${N}` extends `-${string}` ? -1
//         : `${N}` extends "0" ? 0
//             : 1;
type Subsequence<S extends string[], Start extends number | S[number] = 0, End extends number | S[number] = S["length"]> =
    string[] extends S ? Sequence<S> : Sequence<ConstructSubarray<S, Start, End>>;

export type Sequence<S extends string[]> = {
    readonly length: S["length"] extends number ? S["length"] : number;
    readonly segmentNames: unknown extends S[number] ? readonly string[] : readonly S[number][];
    readonly start: number;
    readonly end: number;
    subsequence<Start extends number | S[number] = 0, End extends number | S[number] = string[] extends S ? number : S extends [...infer H, string] ? H["length"] : number>(
        start?: Start, end?: End
    ): Subsequence<S, Start, End>;
    toArray(): Segment[];
} & {
    readonly [key: number]: Segment;
} & (string[] extends S ? {
    readonly [key: string]: unknown;
} : {
    readonly [K in S[number]]: Segment;
});

const SequencePrototype = {
    get start() {
        return this[0]!.start;
    },
    get end() {
        return this[this.length - 1]!.end;
    },
    subsequence<Start extends number | string, End extends number | string>(
        this, start: Start = 0 as Start, end: End = this.length - 1 as End
    ) {
        const output: [string, Segment][] = [];
        const segmentNames = this.segmentNames;
        let startPushing = false;
        if (typeof start === "number" && typeof end === "number") {
            if (end < start)
                return createSequence(output);
            if (Object.is(start, end) && start >= 0 && start < segmentNames.length) {
                const segmentName = segmentNames[start]!;
                output.push([segmentName, this[segmentName] as Segment]);
                return createSequence(output);
            }
        }
        if (typeof start === "number") {
            if (start > segmentNames.length - 1)
                return createSequence(output);
            if (start < 0)
                start = 0 as Start;
        }
        if (typeof end === "number") {
            if (end < 0)
                return createSequence(output);
            if (end > segmentNames.length - 1)
                end = segmentNames.length - 1 as End;
        }

        for (let i = typeof start === "number" ? start : 0; i < segmentNames.length; i++) {
            const segmentName = segmentNames[i]!;
            if (Object.is(end, i) || Object.is(end, segmentName)) {
                if (startPushing) output.push([segmentName, this[segmentName] as Segment]);
                break;
            }
            if (startPushing || Object.is(start, i) || Object.is(start, segmentName)) {
                startPushing = true;
                output.push([segmentName, this[segmentName] as Segment]);
            }
        }

        return createSequence(output);
    },
    toArray() {
        const result: Segment[] = [];
        for (let i = 0; i < this.length; i++) {
            result[i] = this[i]!;
        }
        return result;
    }
} as Sequence<string[]>;

Object.defineProperty(SequencePrototype, Symbol.toStringTag, {
    value: "Sequence",
    writable: false,
    configurable: false
});

function createSequence<S extends string[]>(
    segments: [S[number], Segment][]
) {
    const properties = {
        length: segments.length,
        segmentNames: Object.freeze(segments.map(i => i[0]))
    } as {
        [K in keyof Sequence<S>]?: Sequence<S>[K]
    };

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]!;
        properties[segment[0]] = segment[1] as Sequence<S>[S[number]];
        (properties as any)[i] = segment[1];
    }

    return Object.freeze(
        Object.assign(Object.create(SequencePrototype), properties)
    ) as Sequence<S>;
}

export const Sequence = class {
    private constructor() {
        throw new Error("A sequence object can only be created using the static factory method.");
    }
    static fromSegments<S extends string[]>(...segments: { [K in keyof S]: [S[K], number] }) {
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
                return createSequence(sequence);
            }
        };
    }
    static [Symbol.hasInstance](object: any): object is Sequence<any> {
        return Object.is(Object.getPrototypeOf(object), SequencePrototype)
    }
};

makePropertiesReadonly(Sequence, "fromSegments", Symbol.hasInstance);