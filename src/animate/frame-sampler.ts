import type {Interpolator} from "./interpolator.types.js";
import type {TimelineInspector} from "./timeline-inspector.types.js";
import {createInterpolator} from "./interpolator.runtime.js";
import type {EasingFunction} from "./easing.js";
import {saturate} from "../numbers/index.js";
import {createTimelineInspector} from "./timeline-inspector.runtime.js";

/** @internal */
export interface AnimationClock {
    get time(): number;
}

export type FrameValue =
    | number
    | string
    | FrameValue[]
    | { [key: string]: FrameValue };

export interface FrameFunction<T extends FrameValue> {
    (ti: TimelineInspector, map: Interpolator): T;
}

export interface Frame<T extends FrameValue> {
    readonly time: number;
    readonly value: T;
}

export interface Frames<T extends FrameValue> {
    readonly duration: number;
    readonly fps: number;
    readonly frames: ReadonlyArray<Frame<T>>
}

export interface FrameSamplingOptions {
    duration?: number;
    easing?: EasingFunction;
    fps?: number;
}

export interface FrameSampler<T extends FrameValue> {
    /**
     * sample frame at `time`
     * @param time normalized time 0 → 1
     * */
    sampleAt(time: number): Frame<T>;
    /** emit each frame lazily, one by one */
    emit(options?: FrameSamplingOptions): Generator<Frame<T>>;
    /** collect all frames */
    collect(options?: FrameSamplingOptions): Frames<T>;
}

class FrameSamplerImpl<T extends FrameValue> implements FrameSampler<T> {
    readonly #generateFrame: FrameFunction<T>;
    #time: number;
    readonly #timelineInspector: TimelineInspector;
    readonly #interpolator: Interpolator;

    constructor(func: FrameFunction<T>) {
        this.#generateFrame = func;
        this.#time = 0;
        const sampler = this;
        const clock = { get time() { return sampler.#time }};
        this.#timelineInspector = createTimelineInspector(clock);
        this.#interpolator = createInterpolator(clock);
    }
    sampleAt(time: number): Frame<T> {
        return Object.freeze({
            time: this.#time = time,
            value: this.#generateFrame(this.#timelineInspector, this.#interpolator)
        });
    }
    *emit({ duration = 1, easing, fps = 60 }: FrameSamplingOptions = {}): Generator<Frame<T>> {
        if (!Number.isFinite(duration) || duration <= 0)
            throw new Error("duration must be > 0 and finite.");
        if (!Number.isFinite(fps) || fps <= 0)
            throw new Error("fps must be > 0 and finite.");

        let progress = 0;
        this.#time = 0;

        const noOfFrames = Math.floor(duration * fps);
        if (noOfFrames === 1) {
            yield Object.freeze({
                time: this.#time,
                value: this.#generateFrame(this.#timelineInspector, this.#interpolator)
            });
            return;
        }

        const step = 1 / (noOfFrames - 1);

        do {
            yield Object.freeze({
                time: this.#time,
                value: this.#generateFrame(this.#timelineInspector, this.#interpolator)
            });

            progress = Math.min(progress + step, 1);
            this.#time = saturate(easing ? easing(progress) : progress);
        } while (progress < 1);
    }
    collect({ duration = 1, fps = 60, ...rest }: FrameSamplingOptions = {}) {
        const frames = [...this.emit({ duration, fps, ...rest })];

        return Object.freeze({ duration, fps, frames });
    }
}

export function createFrameSampler<T extends FrameValue>(func: FrameFunction<T>): FrameSampler<T> {
    return new FrameSamplerImpl(func);
}