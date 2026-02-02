import {remap, saturate} from "../numbers/index";
import {EasingFunction, identity} from "./common";

export class Timer {
    private progress: number;
    private readonly progressUnit: number;
    private _time: number = 0;
    private constructor(
        readonly duration: number,
        readonly fps: number,
        private readonly easing: EasingFunction = identity
    ) {
        this.progress = 0;
        this.progressUnit = 1 / (duration * fps - 1);
    }
    get time(): number {
        return this._time;
    }
    public static of(duration: number, easing: EasingFunction = identity) {
        return new Timer(duration, 60, easing);
    }
    public unfinished() {
        return this.progress < 1;
    }
    public tick() {
        if (this.progress >= 1)
            throw new Error("The timer has reached its upper bound.");

        this._time = saturate(
            this.easing(this.progress += this.progressUnit)
        );
    }
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
        return new Segment(saturate(start), saturate(end));
    }
    public static fromInterval(start: number, duration: number) {
        return new Segment(saturate(start), saturate(start + Math.abs(duration)));
    }
}

export function sequence() {
    let durations: number[] = [];
    return {
        addInterval(duration: number) {
            durations.push(duration);
            return this;
        },
        normalize(start: number, end: number) {
            let currentTime = 0;
            const segments: [number, number][] = [];
            for (const duration of durations) {
                segments.push([currentTime, currentTime += duration]);
            }
            const sequence: Segment[] = [];
            for (const segment of segments) {
                sequence.push(Segment.fromRange(
                    remap(segment[0], 0, currentTime, start, end),
                    remap(segment[1], 0, currentTime, start, end)
                ));
            }
            return sequence;
        }
    }
}

export type Timeline = {
    timer: Timer;
    (segment: Segment): {
        hasStarted(): boolean;
        hasFinished(): boolean;
        isActive(): boolean;
    };
};

export function timeline(timer: Timer): Timeline {
    const timeline: Timeline = function (this: Timeline, segment) {
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
    };
    timeline.timer = timer;
    return timeline;
}