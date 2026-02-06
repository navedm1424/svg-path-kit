import {AnimationClock} from "./animation-engine";
import {isSequence, Segment, Sequence} from "./sequence";

export type Timeline = {
    readonly clock: AnimationClock;
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

export function timeline(clock: AnimationClock) {
    const instance = function Timeline(segmentOrSequence) {
        if (!(segmentOrSequence instanceof Segment || isSequence(segmentOrSequence)))
            throw new Error("The argument must either be a segment or a sequence.");

        return {
            hasStarted(): boolean {
                return clock.time >= segmentOrSequence.start;
            },
            hasFinished(): boolean {
                return clock.time >= segmentOrSequence.end;
            },
            isActive(): boolean {
                return clock.time >= segmentOrSequence.start && clock.time < segmentOrSequence.end;
            }
        };
    } as Timeline;
    Object.defineProperty(instance, "clock", {
        value: clock,
        writable: false,
        configurable: false
    });
    return instance;
}