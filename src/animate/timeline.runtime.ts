import {assignReadonlyProperties} from "../utils/object-utils.runtime.js";
import {type AnimationClock, assertAuthorizedAnimationClock} from "./animated-path.js";
import {Sequence} from "./sequence.js";
import {Segment} from "./segment.js";
import type {Timeline} from "./timeline.types.ts";

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