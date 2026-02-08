import type {AnimationProgress} from "./animation-stepper";
import {Segment, Sequence} from "./sequence";
import {assignReadonlyProperties} from "../object-utils";

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

export function createTimeline(progress: AnimationProgress) {
    const instance = function Timeline(segmentOrSequence) {
        if (!(segmentOrSequence instanceof Segment || segmentOrSequence instanceof Sequence))
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
    assignReadonlyProperties(instance, {animationProgress: progress});
    return instance;
}