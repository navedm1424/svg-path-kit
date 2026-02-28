import {type AnimationClock} from "./frame-renderer.js";
import {Sequence} from "./sequence.js";
import {Segment} from "./segment.js";
import type {Timeline} from "./timeline.types.ts";

/** @internal */
export function createTimeline(clock: AnimationClock): Timeline {
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
    const timePropertyKey: keyof Timeline = "time";
    const time = Object.getOwnPropertyDescriptor(clock, timePropertyKey);
    if (!time)
        throw new Error(`Invalid clock! Please provide a valid clock!`);

    Object.defineProperties(instance, { time });
    return Object.freeze(instance);
}