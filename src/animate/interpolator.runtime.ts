import {invLerp, lerp, remap} from "../numbers/index.js";
import {easeIn, easeInOut, easeOut, type EasingFunction} from "./easing.js";
import type {Playhead} from "./frame-sampler.js";
import type {
    Interpolator,
    SegmentMapper,
    SequenceMapper,
    ToAnchorsSpecifier,
    ToRangeSpecifier
} from "./interpolator.types.ts";
import {Sequence} from "./sequence.js";
import {assignReadonlyProperties} from "../utils/object-utils.runtime.js";

const InterpolatorPrototype = {
    segment(segment): SegmentMapper {
        const time = this.playhead.time;
        return {
            withEasing(easing: EasingFunction): ToRangeSpecifier {
                return {
                    to(start: number, end: number) {
                        return lerp(
                            start, end,
                            easing(invLerp(
                                segment.start, segment.end,
                                time
                            ))
                        );
                    }
                };
            },
            to(start: number, end: number) {
                return remap(
                    time,
                    segment.start, segment.end,
                    start, end
                );
            }
        };
    },
    easeIn(segment) {
        return this.segment(segment)
            .withEasing(easeIn);
    },
    easeOut(segment) {
        return this.segment(segment)
            .withEasing(easeOut);
    },
    easeInOut(segment) {
        return this.segment(segment)
            .withEasing(easeInOut);
    },
    sequence<S extends string[]>(sequence: Sequence<S>): SequenceMapper<S> {
        if (!((sequence) instanceof Sequence))
            throw new Error("Invalid sequence object! Please provide a valid sequence.");

        const map = this;
        let easing: EasingFunction | null = null;

        const to = function to(...anchors) {
            if (anchors.length !== sequence.length + 1)
                throw new Error(`The output anchors must be exactly ${sequence.length + 1} in number.`);

            let time = map.playhead.time;
            if (easing)
                time = lerp(
                    sequence.start, sequence.end,
                    easing(invLerp(
                        sequence.start, sequence.end,
                        time
                    ))
                );

            if (time <= sequence.start)
                return anchors[0];
            if (time >= sequence.end)
                return anchors[anchors.length - 1];

            for (let i = 0; i < sequence.length; i++) {
                const segment = sequence[i]!;
                if (segment.start <= time && time < segment.end) {
                    return map(segment).to(anchors[i], anchors[i + 1]);
                }
            }

            return undefined as never;
        } as ToAnchorsSpecifier<S>["to"];

        return {
            withEasing(easingFn: EasingFunction) {
                easing = easingFn;
                return { to };
            }, to
        };
    }
} as Interpolator;

Object.assign(InterpolatorPrototype, {[Symbol.toStringTag]: "Interpolator"});
Object.freeze(InterpolatorPrototype);

/** @internal */
export function createInterpolator(playhead: Playhead) {
    const map = function Interpolator(segment) {
        return map.segment(segment);
    } as Interpolator;
    assignReadonlyProperties(map, { playhead });
    Object.setPrototypeOf(map, InterpolatorPrototype);
    return Object.freeze(map);
}