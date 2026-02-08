import {createAnimationStepper} from "./animation-stepper";
import {createTimeline, type Timeline} from "./timeline";
import {createInterpolator, type Interpolator} from "./interpolator";
import type {Path} from "../path";
import type {EasingFunction} from "./easing";

export type AnimatedPathFunction = (tl: Timeline, interpolate: Interpolator) => Path;

export function generateAnimatedPathFrames(pathFunc: AnimatedPathFunction, duration: number, easing?: EasingFunction) {
    const stepper = createAnimationStepper(duration, easing);
    const tl = createTimeline(stepper.progress);
    const interpolate = createInterpolator(stepper.progress);
    const paths: Path[] = [];
    do {
        paths.push(pathFunc(tl, interpolate));
        stepper.step();
    } while (!stepper.progress.isComplete());
    return paths;
}