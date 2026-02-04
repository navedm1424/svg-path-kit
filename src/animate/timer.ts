import {EasingFunction, identity} from "./common";
import {saturate} from "../numbers/index";

export interface Timer {
    readonly time: number;
    unfinished(): boolean;
    tick(): void;
}

export function timer(duration: number, easing: EasingFunction = identity): Timer {
    const fps = 60;
    let progress = 0;
    const progressUnit = 1 / (duration * fps - 1);
    let time = 0;
    return {
        get time(): number {
            return time;
        },
        unfinished() {
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
}