import {AnimationProgress} from "./animation-stepper";
import {isSequence, Segment, Sequence} from "./sequence";

export type Timeline = {
    readonly animationProgress: AnimationProgress;
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

export function timeline(progress: AnimationProgress) {
    const instance = function Timeline(segmentOrSequence) {
        if (!(segmentOrSequence instanceof Segment || isSequence(segmentOrSequence)))
            throw new Error("The argument must either be a segment or a sequence.");

        return {
            hasStarted(): boolean {
                return progress.time >= segmentOrSequence.start;
            },
            hasFinished(): boolean {
                return progress.time >= segmentOrSequence.end;
            },
            isActive(): boolean {
                return progress.time >= segmentOrSequence.start && progress.time < segmentOrSequence.end;
            }
        };
    } as Timeline;
    Object.defineProperty(instance, "animationProgress", {
        value: progress,
        writable: false,
        configurable: false
    });
    return instance;
}