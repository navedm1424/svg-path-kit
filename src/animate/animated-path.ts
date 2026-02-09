import {createTimeline, type Timeline} from "./timeline";
import {createInterpolator, type Interpolator} from "./interpolator";
import type {Path} from "../path";
import type {EasingFunction} from "./easing";
import {saturate} from "../numbers/index";
import {assignReadonlyProperties} from "../utils/object-utils";

export interface AnimationClock {
    readonly time: number;
}

const AnimationClockPrototype: AnimationClock = {
    get time() {
        return undefined as unknown as number;
    }
};

export function assertAuthorizedAnimationClock(value: any): asserts value is AnimationClock {
    if (Object.is(Object.getPrototypeOf(value), AnimationClockPrototype))
        return;
    throw new Error("The animation clock is unauthorized.");
}

export type AnimatedPathFunction = (clock: AnimationClock, tl: Timeline, map: Interpolator) => Path;

export interface PathFrames extends Array<Path> {
    readonly duration: number;
    readonly fps: number;
    toSVGPathStrings(): string[];
    exportToJson(outputDirectoryPath: string, outputFileName: string): Promise<string>;
}

const pathFramesMethods = {
    toSVGPathStrings() {
        const pathStrings: string[] = [];
        for (const p of this)
            pathStrings.push(p.toSVGPathString());
        return pathStrings;
    },
    async exportToJson(outputDirectoryPath: string, outputFileName: string) {
        if (typeof window !== "undefined" || typeof process === "undefined" || !process.versions?.node)
            throw new Error(`${this.exportToJson.name} can only run in Node.js`);

        const { writeJsonFile } = require("../utils/file-utils");
        return writeJsonFile(outputDirectoryPath, outputFileName, {
            durationMs: this.duration * 1000,
            fps: this.fps,
            easing: "linear",
            frames: this.toSVGPathStrings()
        });
    }
} as PathFrames;

export class AnimatedPath {
    readonly #animatedPathFunction: AnimatedPathFunction;
    constructor(func: AnimatedPathFunction) {
        this.#animatedPathFunction = func;
    }
    computePathFrameAt(time: number) {
        const clock: AnimationClock = {
            get time() {
                return time;
            }
        };
        Object.setPrototypeOf(clock, AnimationClockPrototype);
        return this.#animatedPathFunction(clock, createTimeline(clock), createInterpolator(clock));
    }
    computePathFrames(duration: number, easing?: EasingFunction) {
        const fps = 60;
        let progress = 0;
        const progressUnit = 1 / (duration * fps - 1);
        let time = 0;
        const clock: AnimationClock = {
            get time() {
                return time
            }
        };
        Object.setPrototypeOf(clock, AnimationClockPrototype);
        const tl = createTimeline(clock);
        const interpolate = createInterpolator(clock);
        const paths = [] as Path[] as PathFrames;
        do {
            paths.push(this.#animatedPathFunction(clock, tl, interpolate));
            progress += progressUnit;
            time = saturate(easing ? easing(progress) : progress);
        } while (progress < 1);
        assignReadonlyProperties(paths, { duration, fps });
        assignReadonlyProperties(paths, pathFramesMethods);

        return paths;
    }
}