import {remap, saturate} from "../numbers/index";
import {Slice, TupleIndex} from "./array-utils";
import {Timer} from "./timer";

export class Segment {
    private constructor(
        readonly start: number,
        readonly end: number
    ) {}
    get duration(): number {
        return this.end - this.start;
    }
    public static fromRange(start: number, end: number) {
        if (start > end)
            [start, end] = [end, start];
        return new Segment(saturate(start), saturate(end));
    }
    public static fromInterval(start: number, duration: number) {
        let end = start + duration;
        if (start > end)
            [start, end] = [end, start];
        return new Segment(saturate(start), saturate(end));
    }
}

export type Sequence<S extends readonly string[]> = {
    readonly [K in S[number]]: Segment;
} & {
    readonly [I in TupleIndex<S>]: Segment;
} & {
    readonly length: S["length"];
    readonly segmentNames: S;
    readonly start: number;
    readonly end: number;
    slice<Start extends number | S[number] = 0, End extends number | S[number] = S["length"]>(
        start?: Start, end?: End
    ): Sequence<Slice<S, Start, End>>;
    toArray(): Segment[];
};

function createSequence<S extends readonly string[]>(
    segments: [S[number], Segment][]
): Sequence<S> {
    const sequence = {
        get start() {
            return this[0 as TupleIndex<S>].start;
        },
        get end() {
            return this[this.length - 1 as TupleIndex<S>].end;
        },
        slice<Start extends number | string, End extends number | string>(
            this, start: Start = 0 as Start, end: End = this.length as End
        ): Sequence<Slice<S, Start, End>> {
            const output: [string, Segment][] = [];
            const segmentNames = this.segmentNames;
            let startPushing = false;

            for (let i = 0; ; i++) {
                const segmentName = segmentNames[i];
                if (Object.is(end, i) || Object.is(end, segmentName))
                    break;
                if (startPushing || Object.is(start, i) || Object.is(start, segmentName)) {
                    startPushing = true;
                    output.push([segmentName, this[segmentName as S[number]]]);
                }
            }

            return createSequence(output);
        },
        toArray() {
            const result: Segment[] = [];
            for (let i = 0; i < this.length; i++) {
                result[i] = this[i as TupleIndex<S>];
            }
            return result;
        }
    } as Sequence<S>;
    Object.defineProperty(sequence, "length", {
        value: segments.length,
        writable: false,
        configurable: false
    });
    Object.defineProperty(sequence, "segmentNames", {
        value: segments.map(i => i[0]),
        writable: false,
        configurable: false
    });
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        Object.defineProperty(sequence, segment[0], {
            value: segment[1],
            writable: false,
            configurable: false
        });
        Object.defineProperty(sequence, i, {
            value: segment[1],
            writable: false,
            configurable: false
        });
    }
    return sequence;
}

export function sequence<
    const S extends readonly string[]
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
                sequence[i] = [name, Segment.fromInterval(
                    remap(currentTime, 0, totalTime, start, end),
                    remap(duration, 0, totalTime, start, end)
                )];
                currentTime += duration;
            }
            return createSequence(sequence);
        }
    }
}

export type Timeline = {
    readonly timer: Timer;
    (segment: Segment): {
        hasStarted(): boolean;
        hasFinished(): boolean;
        isActive(): boolean;
    };
};

export function timeline(timer: Timer): Timeline {
    const timeline = function (this: Timeline, segment) {
        return {
            hasStarted(): boolean {
                return timer.time >= segment.start;
            },
            hasFinished(): boolean {
                return timer.time >= segment.end;
            },
            isActive(): boolean {
                return timer.time >= segment.start && timer.time < segment.end;
            }
        };
    } as Timeline;
    Object.defineProperty(timeline, "timer", {
        value: timer,
        writable: false,
        configurable: false
    });
    return timeline;
}