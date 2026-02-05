import {Timer} from "./timer";
import {isSequence, Segment, Sequence} from "./sequence";

export type Timeline = {
    readonly timer: Timer;
    (segment: Segment): {
        hasStarted(): boolean;
        hasFinished(): boolean;
        isActive(): boolean;
    };
    (sequence: Sequence<string[]>): {
        hasStarted(): boolean;
        hasFinished(): boolean;
        isActive(): boolean;
    };
};

export function timeline(timer: Timer): Timeline {
    const timeline = function (this: Timeline, segmentOrSequence) {
        if (!(segmentOrSequence instanceof Segment || isSequence(segmentOrSequence)))
            throw new Error("The argument must either be a segment or a sequence.");

        return {
            hasStarted(): boolean {
                return timer.time >= segmentOrSequence.start;
            },
            hasFinished(): boolean {
                return timer.time >= segmentOrSequence.end;
            },
            isActive(): boolean {
                return timer.time >= segmentOrSequence.start && timer.time < segmentOrSequence.end;
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