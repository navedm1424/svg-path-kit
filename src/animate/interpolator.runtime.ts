import {invLerp, lerp, remap} from "../numbers/index.js";
import {easeIn, easeInOut, easeOut, type EasingFunction} from "./easing.js";
import type {AnimationClock} from "./frame-renderer.js";
import type {
    Interpolator,
    SegmentMapper,
    SequenceMapper,
    ToAnchorsSpecifier,
    ToRangeSpecifier
} from "./interpolator.types.ts";
import {Sequence} from "./sequence.js";

const InterpolatorPrototype = {
    segment(segment): SegmentMapper {
        const time = this.time;
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
        let time = this.time;

        const map = this;
        const to = function to(...anchors) {
            if (anchors.length !== sequence.length + 1)
                throw new Error(`The output anchors must be exactly ${sequence.length + 1} in number.`);

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
            withEasing(easing: EasingFunction) {
                time = lerp(
                    sequence.start, sequence.end,
                    easing(invLerp(
                        sequence.start, sequence.end,
                        time
                    ))
                );
                return { to };
            }, to
        };
    }
} as Interpolator;

Object.assign(InterpolatorPrototype, {[Symbol.toStringTag]: "Interpolator"});
Object.freeze(InterpolatorPrototype);

/** @internal */
export function createInterpolator(clock: AnimationClock) {
    const map = function Interpolator(segment) {
        return map.segment(segment);
    } as Interpolator;
    const timePropertyKey: keyof Interpolator = "time";
    const time = Object.getOwnPropertyDescriptor(clock, timePropertyKey);
    if (!time)
        throw new Error(`Invalid clock! Please provide a valid clock!`);

    Object.defineProperties(map, { time });
    Object.setPrototypeOf(map, InterpolatorPrototype);
    return Object.freeze(map);
}