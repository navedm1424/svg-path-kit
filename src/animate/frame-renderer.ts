import {createTimeline} from "./timeline.runtime.js";
import {createInterpolator} from "./interpolator.runtime.js";
import type {EasingFunction} from "./easing.js";
import {saturate} from "../numbers/index.js";
import type {Interpolator} from "./interpolator.types.js";
import type {Timeline} from "./timeline.types.js";
import {writeJsonFile} from "../utils/file-utils.runtime.js";

/** @internal */
export interface AnimationClock {
    get time(): number;
}

type FrameValueType = string | number | Array<string | number> | Record<string, string | number>;

export interface AnimationFunction<T extends FrameValueType> {
    (tl: Timeline, map: Interpolator): T;
}

export interface Frame<T extends FrameValueType> {
    readonly time: number;
    readonly value: T;
    exportToJson(outputDirectoryPath: string, outputFileName: string): Promise<string>;
    valueOf(): T;
    [Symbol.toPrimitive](): T;
}

export interface Frames<T extends FrameValueType> extends ReadonlyArray<T> {
    readonly duration: number;
    readonly fps: number;
    exportToJson(outputDirectoryPath: string, outputFileName: string): Promise<string>;
}

export interface FrameRenderer<T extends FrameValueType> {
    /** render frame at `time` */
    renderFrameAt(time: number): Frame<T>;
    /** render all frames with the optionally specified options (`duration`, `easing`, `fps`) */
    renderFrames(options?: { duration?: number, easing?: EasingFunction, fps?: number }): Frames<T>;
}

const FramePrototype = {
    async exportToJson(outputDirectoryPath: string, outputFileName: string): Promise<string> {
        if (typeof window !== "undefined" || typeof process === "undefined" || !process.versions?.node)
            throw new Error(`${this.exportToJson.name} can only run in Node.js`);

        return writeJsonFile(outputDirectoryPath, outputFileName, {
            time: this.time,
            frame: this.value
        });
    },
    valueOf() {
        return this.value;
    },
    [Symbol.toPrimitive]() {
        return this.value;
    }
} as Frame<FrameValueType>;
Object.assign(FramePrototype, {
    toString() {
        return String(this.valueOf())
    }
});
Object.defineProperty(FramePrototype, Symbol.toStringTag, {
    value: "Frame", writable: false, configurable: false
});

const FramesPrototype = {
    async exportToJson(outputDirectoryPath: string, outputFileName: string) {
        if (typeof window !== "undefined" || typeof process === "undefined" || !process.versions?.node)
            throw new Error(`${this.exportToJson.name} can only run in Node.js`);

        return writeJsonFile(outputDirectoryPath, outputFileName, {
            durationMs: this.duration * 1000,
            fps: this.fps,
            frames: [...this]
        });
    }
} as Frames<FrameValueType>;
Object.defineProperty(FramesPrototype, Symbol.toStringTag, {
    value: "Frames", writable: false, configurable: false
});
Object.setPrototypeOf(FramesPrototype, Array.prototype);

class FrameRendererImpl<T extends FrameValueType> implements FrameRenderer<T> {
    readonly #animationFunction: AnimationFunction<T>;
    constructor(func: AnimationFunction<T>) {
        this.#animationFunction = func;
    }
    renderFrameAt(time: number) {
        const clock = { get time() { return time } };
        const frame = this.#animationFunction(createTimeline(clock), createInterpolator(clock));
        return Object.freeze(Object.setPrototypeOf({ time, value: frame }, FramePrototype)) as Frame<T>;
    }
    renderFrames({ duration = 1, easing, fps = 60 }: {
        duration?: number, easing?: EasingFunction, fps?: number
    } = {}) {
        let progress = 0;
        const progressUnit = 1 / (duration * fps - 1);
        let time = 0;
        const clock = { get time() { return time } };
        const tl = createTimeline(clock);
        const map = createInterpolator(clock);
        const frames: T[] = [];
        do {
            frames.push(this.#animationFunction(tl, map));
            progress += progressUnit;
            time = saturate(easing ? easing(progress) : progress);
        } while (progress < 1);
        Object.defineProperties(frames, {
            duration: {
                value: duration,
                enumerable: false
            },
            fps: {
                value: fps,
                enumerable: false
            }
        });
        Object.setPrototypeOf(frames, FramesPrototype);

        return Object.freeze(frames) as Frames<T>;
    }
}

export function createFrameRenderer<T extends FrameValueType>(func: AnimationFunction<T>): FrameRenderer<T> {
    return new FrameRendererImpl(func);
}