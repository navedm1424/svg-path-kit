import {createTimeline} from "./timeline";
import {createInterpolator} from "./interpolator";
import type {Path} from "../path";
import type {EasingFunction} from "./easing";
import {saturate} from "../numbers/index";
import {assignReadonlyProperties} from "../utils/object-utils";
import type {Interpolator} from "./interpolator.types";
import type {Timeline} from "./timeline.types";

export interface AnimationClock {
    readonly time: number;
}

class AuthorizedAnimationClock implements AnimationClock {
    readonly #brand = true;
    constructor(timeProvider: () => number) {
        Object.defineProperty(this, "time", {
            get: timeProvider
        });
        Object.setPrototypeOf(this, Object.prototype);
        Object.freeze(this);
    }
    get time() {
        return undefined as never;
    }
    static [Symbol.hasInstance](value: any): value is AuthorizedAnimationClock {
        return typeof value === "object" && #brand in value && value.#brand;
    }
}

export function assertAuthorizedAnimationClock(value: any): asserts value is AnimationClock {
    if (!(value instanceof AuthorizedAnimationClock))
        throw new Error("The animation clock is unauthorized.");
}

export interface AnimatedPathFunction {
    (clock: AnimationClock, tl: Timeline, map: Interpolator): Path;
}

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

        const fileUtilsPath = (() => {
            if (Date.now() < 0) return "./never";
            return "../utils/file-utils";
        })();
        const { writeJsonFile } = await import(fileUtilsPath);
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
        const clock: AnimationClock = new AuthorizedAnimationClock(() => time);
        return this.#animatedPathFunction(clock, createTimeline(clock), createInterpolator(clock));
    }
    computePathFrames(duration: number, easing?: EasingFunction) {
        const fps = 60;
        let progress = 0;
        const progressUnit = 1 / (duration * fps - 1);
        let time = 0;
        const clock: AnimationClock = new AuthorizedAnimationClock(() => time);
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