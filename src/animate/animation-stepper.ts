import {saturate} from "../numbers/index";

import {EasingFunction} from "./easing";

export interface AnimationProgress {
    readonly time: number;
    isComplete(): boolean;
}

export interface AnimationStepper {
    readonly progress: AnimationProgress;
    step(): void;
}

export function createAnimationStepper(duration: number, easing?: EasingFunction) {
    const fps = 60;
    let progress = 0;
    const progressUnit = 1 / (duration * fps - 1);
    let time = 0;
    const animationProgress: AnimationProgress = {
        get time() {
            return time;
        },
        isComplete() {
            return progress >= 1;
        }
    };
    Object.defineProperty(animationProgress, Symbol.toStringTag, {
        value: "AnimationProgress",
        writable: false,
        configurable: false
    });
    const instance = {
        step() {
            if (this.progress.isComplete())
                throw new Error("The animation has completed.");

            progress += progressUnit;
            time = saturate(easing ? easing(progress): progress);
        }
    } as AnimationStepper;
    Object.defineProperties(instance, {
        progress: {
            value: animationProgress,
            writable: false,
            configurable: false
        },
        [Symbol.toStringTag]: {
            value: "AnimationStepper",
            writable: false,
            configurable: false
        }
    });
    return instance;
}