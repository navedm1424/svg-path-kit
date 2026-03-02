import type {AnimationClock} from "./frame-sampler.js";
import type {TimelineInspector} from "./timeline-inspector.types.js";
import {Segment} from "./segment.js";
import {Sequence} from "./sequence.js";

/** @internal */
export function createTimelineInspector(clock: AnimationClock): TimelineInspector {
    const instance = function TimelineInspector(subject) {
        if (!(subject instanceof Segment || (subject) instanceof Sequence))
            throw new Error("The argument must either be a segment or a sequence.");

        return {
            hasStarted(): boolean {
                return instance.time >= subject.start;
            },
            hasFinished(): boolean {
                return instance.time >= subject.end;
            },
            isActive(): boolean {
                return instance.time >= subject.start && instance.time < subject.end;
            }
        };
    } as TimelineInspector;
    const timePropertyKey: keyof TimelineInspector = "time";
    const time = Object.getOwnPropertyDescriptor(clock, timePropertyKey);
    if (!time)
        throw new Error(`Invalid clock! Please provide a valid clock!`);

    Object.defineProperties(instance, { time });
    return Object.freeze(instance);
}