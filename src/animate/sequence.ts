import {remap, saturate} from "../numbers/index";
import {Slice} from "./array-utils";

export class Segment {
    readonly start: number;
    readonly end: number;
    readonly duration: number;

    private constructor(start: number, end: number) {
        if (start > end)
            [start, end] = [end, start];
        this.start = saturate(start);
        this.end = saturate(end);
        this.duration = this.end - this.start;
    }
    public static ofRange(startTime: number, endTime: number) {
        return new Segment(startTime, endTime);
    }
    public static ofInterval(startTime: number, duration: number) {
        return new Segment(startTime, startTime + duration);
    }
}

export type Sequence<S extends string[]> = {
    readonly length: S["length"] extends number ? S["length"] : number;
    readonly segmentNames: unknown extends S[number] ? readonly string[] : readonly S[number][];
    readonly start: number;
    readonly end: number;
    slice<Start extends number | S[number] = 0, End extends number | S[number] = S["length"]>(
        start?: Start, end?: End
    ): Sequence<Slice<S, Start, End>>;
    toArray(): Segment[];
} & Readonly<Record<number, Segment>>
    & (string[] extends S ? Readonly<Record<string, unknown>> : Readonly<Record<S[number], Segment>>);

const SequencePrototype = {
    get start() {
        return this[0].start;
    },
    get end() {
        return this[this.length - 1].end;
    },
    slice<Start extends number | string, End extends number | string>(
        this, start: Start = 0 as Start, end: End = this.length as End
    ) {
        const output: [string, Segment][] = [];
        const segmentNames = this.segmentNames;
        let startPushing = false;

        for (let i = 0; ; i++) {
            const segmentName = segmentNames[i];
            if (Object.is(end, i) || Object.is(end, segmentName))
                break;
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
            result[i] = this[i];
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
    const properties: PropertyDescriptorMap = {
        length: {
            value: segments.length,
            writable: false,
            configurable: false
        },
        segmentNames: {
            value: Object.freeze(segments.map(i => i[0])),
            writable: false,
            configurable: false
        }
    };
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        properties[segment[0]] = {
            value: segment[1],
            writable: false,
            configurable: false
        };
        properties[i] = {
            value: segment[1],
            writable: false,
            configurable: false
        };
    }
    return Object.create(SequencePrototype, properties) as Sequence<S>;
}

export function sequence<
    const S extends string[]
>(...intervals: { [K in keyof S]: [S[K], number] }) {
    return {
        remap(start: number, end: number): Sequence<S> {
            start = saturate(start);
            end = saturate(end);
            const sequence: [string, Segment][] = [];
            let totalTime = intervals.reduce(
                (acc, cur) => acc + cur[1], 0
            );
            let currentTime = 0;
            for (let i = 0; i < intervals.length; i++) {
                const interval = intervals[i];
                const name = interval[0];
                const duration = Math.abs(interval[1]);
                sequence[i] = [name, Segment.ofInterval(
                    remap(currentTime, 0, totalTime, start, end),
                    remap(duration, 0, totalTime, start, end)
                )];
                currentTime += duration;
            }
            return createSequence<S>(sequence);
        }
    }
}

export function isSequence(sequence: any) {
    return Object.is(Object.getPrototypeOf(sequence), SequencePrototype);
}