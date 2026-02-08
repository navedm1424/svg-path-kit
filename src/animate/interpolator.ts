import {invLerp, lerp, remap} from "../numbers/index";
import {Segment, Sequence} from "./sequence";
import type {AnimationProgress} from "./animation-stepper";
import {type EasingFunction, easeIn, easeInOut, easeOut} from "./easing";
import {assignReadonlyProperties} from "../object-utils";

interface ToRangeSpecifier {
    to(start: number, end: number): number;
}

interface SegmentMapper extends ToRangeSpecifier {
    withEasing(easing: EasingFunction): ToRangeSpecifier;
}

type MapToType<IL extends readonly any[], OT> = IL extends [any, ...infer Tail] ?
    [OT, ...MapToType<Tail, OT>] : [];

interface ToAnchorsSpecifier<S extends string[]> {
    to(...anchors: [number, ...MapToType<S, number>]): number;
}

interface SequenceMapper<S extends string[]> extends ToAnchorsSpecifier<S> {
    withEasing(easing: EasingFunction): ToAnchorsSpecifier<S>;
}

export interface Interpolator {
    readonly animationProgress: AnimationProgress;
    (segment: Segment): SegmentMapper;
    segment(segment: Segment): SegmentMapper;
    easeIn(segment: Segment): ToRangeSpecifier;
    easeOut(segment: Segment): ToRangeSpecifier;
    easeInOut(segment: Segment): ToRangeSpecifier;
    sequence<S extends string[]>(sequence: Sequence<S>): SequenceMapper<S>;
    [Symbol.toStringTag]: "Interpolator";
}

const InterpolatorPrototype = {
    segment(segment): SegmentMapper {
        const time = this.animationProgress.time;
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
        if (!(sequence instanceof Sequence))
            throw new Error("Invalid sequence object! Please provide a valid sequence.");
        let time = this.animationProgress.time;

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

            return -1 as never;
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

assignReadonlyProperties(InterpolatorPrototype, {[Symbol.toStringTag]: "Interpolator"});

export function createInterpolator(progress: AnimationProgress) {
    const instance = function Interpolator(segment) {
        return instance.segment(segment);
    } as Interpolator;
    assignReadonlyProperties(instance, {animationProgress: progress});
    Object.setPrototypeOf(instance, InterpolatorPrototype);
    return instance;
}