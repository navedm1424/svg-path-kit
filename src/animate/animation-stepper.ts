import {saturate} from "../numbers/index";
import type {EasingFunction} from "./easing";
import {makePropertiesReadonly} from "../object-utils";

export interface AnimationProgress {
    readonly time: number;
    isComplete(): boolean;
    readonly [Symbol.toStringTag]: "AnimationProgress";
}

export interface AnimationStepper {
    readonly progress: AnimationProgress;
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
        isComplete() {
            return progress >= 1;
        },
        [Symbol.toStringTag]: "AnimationProgress"
    }) as AnimationProgress;
    return Object.freeze({
        progress: animationProgress,
        step() {
            if (this.progress.isComplete())
                throw new Error("The animation has completed.");

            progress += progressUnit;
            time = saturate(easing ? easing(progress) : progress);
        },
        [Symbol.toStringTag]: "AnimationStepper"
    }) as AnimationStepper;
}