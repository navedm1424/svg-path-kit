import type {EasingFunction} from "./easing.ts";
import type {Sequence} from "./sequence.ts";
import type {Segment} from "./segment.ts";

export interface ToRangeSpecifier {
    to(start: number, end: number): number;
}

export interface SegmentMapper extends ToRangeSpecifier {
    withEasing(easing: EasingFunction): ToRangeSpecifier;
}

type MapToType<IL extends readonly any[], OT> = IL extends [any, ...infer Tail] ?
    [OT, ...MapToType<Tail, OT>] : [];

export interface ToAnchorsSpecifier<S extends string[]> {
    to(...anchors: [number, ...MapToType<S, number>]): number;
}

export interface SequenceMapper<S extends string[]> extends ToAnchorsSpecifier<S> {
    withEasing(easing: EasingFunction): ToAnchorsSpecifier<S>;
}

export interface Interpolator {
    get time(): number;
    (segment: Segment): SegmentMapper;
    segment(segment: Segment): SegmentMapper;
    easeIn(segment: Segment): ToRangeSpecifier;
    easeOut(segment: Segment): ToRangeSpecifier;
    easeInOut(segment: Segment): ToRangeSpecifier;
    sequence<S extends string[]>(sequence: Sequence<S>): SequenceMapper<S>;
}