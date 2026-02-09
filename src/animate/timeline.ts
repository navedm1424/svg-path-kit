import {Segment, Sequence} from "./sequence";
import {assignReadonlyProperties} from "../object-utils";
import {type AnimationClock, assertAuthorizedAnimationClock} from "./animated-path";

export type Timeline = {
    readonly animationClock: AnimationClock;
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

export function createTimeline(clock: AnimationClock) {
    assertAuthorizedAnimationClock(clock);
    const instance = function Timeline(selection) {
        if (!(selection instanceof Segment || selection instanceof Sequence))
            throw new Error("The argument must either be a segment or a sequence.");

        return {
            hasStarted(): boolean {
                return clock.time >= selection.start;
            },
            hasFinished(): boolean {
                return clock.time >= selection.end;
            },
            isActive(): boolean {
                return clock.time >= selection.start && clock.time < selection.end;
            }
        };
    } as Timeline;
    assignReadonlyProperties(instance, {animationClock: clock});
    return instance;
}