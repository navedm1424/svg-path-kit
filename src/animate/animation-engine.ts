import {EasingFunction} from "./common";
import {saturate} from "../numbers/index";

export interface AnimationClock {
    readonly time: number;
}

export interface AnimationEngine {
    readonly clock: AnimationClock;
    isRunning(): boolean;
    tick(): void;
}

export function animationEngine(duration: number, easing?: EasingFunction) {
    const fps = 60;
    let progress = 0;
    const progressUnit = 1 / (duration * fps - 1);
    let time = 0;
    const clock: AnimationClock = {
        get time() {
            return time;
        }
    };
    Object.defineProperty(clock, Symbol.toStringTag, {
        value: "AnimationClock",
        writable: false,
        configurable: false
    });
    const instance = {
        isRunning() {
            return progress < 1;
        },
        tick() {
            if (progress >= 1)
                throw new Error("The timer has reached its upper bound.");

            progress += progressUnit;
            time = saturate(easing ? easing(progress): progress);
        }
    };
    Object.defineProperties(instance, {
        clock: {
            value: clock,
            writable: false,
            configurable: false
        },
        [Symbol.toStringTag]: {
            value: "AnimationEngine",
            writable: false,
            configurable: false
        }
    });
    return instance as AnimationEngine;
}