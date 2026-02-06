import {invLerp, lerp, remap} from "../numbers/index";
import {isSequence, Segment, Sequence} from "./sequence";
import {AnimationProgress} from "./animation-stepper";
import {MapToType} from "./array-utils";
import {EasingFunction, easeIn, easeInOut, easeOut} from "./easing";

interface ToRangeSpecifier {
    to(start: number, end: number): number;
}

type SegmentMapper = {
    withEasing(easing: EasingFunction): ToRangeSpecifier;
} & ToRangeSpecifier;

interface ToSequenceSpecifier<S extends string[]> {
    to(...sequence: [number, ...MapToType<S, number>]): number;
}

type SequenceMapper<S extends string[]> = {
    withEasing(easing: EasingFunction): ToSequenceSpecifier<S>;
} & ToSequenceSpecifier<S>;

export interface Interpolator {
    readonly animationProgress: AnimationProgress;
    (segment: Segment): SegmentMapper;
    segment(segment: Segment): SegmentMapper;
    easeIn(segment: Segment): ToRangeSpecifier;
    easeOut(segment: Segment): ToRangeSpecifier;
    easeInOut(segment: Segment): ToRangeSpecifier;
    sequence<S extends string[]>(sequence: Sequence<S>): SequenceMapper<S>;
}

type GetSegmentsFromSequence<S extends Sequence<any>> = S extends Sequence<infer T> ? T : never;

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
    sequence(sequence): SequenceMapper<GetSegmentsFromSequence<typeof sequence>> {
        if (!isSequence(sequence))
            throw new Error("The sequence object must be valid.");
        let time = this.animationProgress.time;

        const map = this;
        const to = function to(...outputSequence) {
            if (outputSequence.length !== sequence.length + 1)
                throw new Error(`The output sequence must have exactly ${sequence.length + 1} elements.`);

            if (time <= sequence.start)
                return outputSequence[0];
            if (time >= sequence.end)
                return outputSequence[outputSequence.length - 1];

            for (let i = 0; i < sequence.length; i++) {
                const segment = sequence[i];
                if (segment.start <= time && time < segment.end) {
                    return map.segment(segment).to(outputSequence[i], outputSequence[i + 1]);
                }
            }

            return -1 as never;
        } as ToSequenceSpecifier<GetSegmentsFromSequence<typeof sequence>>["to"];

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

Object.defineProperty(InterpolatorPrototype, Symbol.toStringTag, {
    value: "Interpolator",
    writable: false,
    configurable: false
});

export function createInterpolator(progress: AnimationProgress) {
    const instance = function Interpolator(segment) {
        return instance.segment(segment);
    } as Interpolator;
    Object.defineProperty(instance, "animationProgress", {
        value: progress,
        writable: false,
        configurable: false
    });
    Object.setPrototypeOf(instance, InterpolatorPrototype);
    return instance;
}