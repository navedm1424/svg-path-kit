import {EasingFunction, identity} from "./common";
import {saturate} from "../numbers/index";

export interface Clock {
    readonly time: number;
}

export interface Playhead {
    readonly clock: Clock;
    isRunning(): boolean;
    tick(): void;
}

export function playhead(duration: number, easing: EasingFunction = identity) {
    const fps = 60;
    let progress = 0;
    const progressUnit = 1 / (duration * fps - 1);
    let time = 0;
    const clock: Clock = {
        get time() {
            return time;
        }
    };
    const instance = {
        isRunning() {
            return progress < 1;
        },
        tick() {
            if (progress >= 1)
                throw new Error("The timer has reached its upper bound.");

            time = saturate(
                easing(progress += progressUnit)
            );
        }
    };
    Object.defineProperties(instance, {
        clock: {
            value: clock,
            writable: false,
            configurable: false
        },
        [Symbol.toStringTag]: {
            value: "Timer",
            writable: false,
            configurable: false
        }
    });
    return instance as Playhead;
}