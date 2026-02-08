import {saturate} from "../numbers/index";
import type {EasingFunction} from "./easing";

export interface AnimationProgress {
    readonly time: number;
    readonly [Symbol.toStringTag]: "AnimationProgress";
}

export interface AnimationStepper {
    readonly progress: AnimationProgress;
    hasFinished(): boolean;
    step(): void;
    readonly [Symbol.toStringTag]: "AnimationStepper";
}

export function createAnimationStepper(duration: number, easing?: EasingFunction) {
    const fps = 60;
    let progress = 0;
    const progressUnit = 1 / (duration * fps - 1);
    let time = 0;
    const animationProgress = Object.freeze({
        get time() {
            return time;
        },
        [Symbol.toStringTag]: "AnimationProgress"
    }) as AnimationProgress;
    return Object.freeze({
        progress: animationProgress,
        hasFinished() {
            return progress >= 1;
        },
        step() {
            if (this.hasFinished())
                throw new Error("The animation has completed.");

            progress += progressUnit;
            time = saturate(easing ? easing(progress) : progress);
        },
        [Symbol.toStringTag]: "AnimationStepper"
    }) as AnimationStepper;
}