import {assignReadonlyProperties} from "../utils/object-utils";
import {type AnimationClock, assertAuthorizedAnimationClock} from "./animated-path";
import {Sequence} from "./sequence";
import {Segment} from "./segment";
import type {Timeline} from "./timeline.types";

/** @internal */
export function createTimeline(clock: AnimationClock): Timeline {
    assertAuthorizedAnimationClock(clock);
    const instance = function Timeline(selection) {
        if (!(selection instanceof Segment || (selection) instanceof Sequence))
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
    return Object.freeze(instance);
}