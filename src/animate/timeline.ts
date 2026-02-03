import {remap, saturate} from "../numbers/index";
import {EasingFunction, identity} from "./common";

export interface Timer {
    readonly time: number;
    unfinished(): boolean;
    tick(): void;
}

export function timer(duration: number, easing: EasingFunction = identity): Timer {
    const fps = 60;
    let progress = 0;
    const progressUnit = 1 / (duration * fps - 1);
    let time = 0;
    return {
        get time(): number {
            return time;
        },
        unfinished() {
            return progress < 1;
        },
        tick() {
            if (progress >= 1)
                throw new Error("The timer has reached its upper bound.");

            time = saturate(
                easing(progress += progressUnit)
            );
        }
    };
}

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

export type Sequence<S extends string> = {
    readonly [key in S]: Segment;
} & {
    readonly length: number;
    readonly [n: number]: Segment;
    readonly start: number;
    readonly end: number;
};

export function sequence<S extends string>(...intervals: [name: S, duration: number][]) {
    return {
        remap(start: number, end: number) {
            start = saturate(start);
            end = saturate(end);
            const sequence = {
                get start() {
                    return this[0].start;
                },
                get end() {
                    return this[this.length - 1].end;
                }
            } as Sequence<S>;
            let totalTime = intervals.reduce(
                (acc, cur) => acc + cur[1], 0
            );
            let currentTime = 0;
            for (let i = 0; i < intervals.length; i++) {
                const interval = intervals[i];
                const name = interval[0];
                const duration = Math.abs(interval[1]);
                Object.defineProperty(sequence, name, {
                    value: Segment.fromInterval(
                        remap(currentTime, 0, totalTime, start, end),
                        remap(duration, 0, totalTime, start, end)
                    ),
                    writable: false,
                    configurable: false
                });
                Object.defineProperty(sequence, i, {
                    value: sequence[name],
                    writable: false,
                    configurable: false
                });
                currentTime += duration;
            }
            return sequence;
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