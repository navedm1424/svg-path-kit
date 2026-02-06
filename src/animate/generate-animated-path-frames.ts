import {createTimeline, Timeline} from "./timeline";
import {createInterpolator, Interpolator} from "./interpolator";
import {Path} from "../path";
import {createAnimationStepper} from "./animation-stepper";
import {EasingFunction} from "./easing";

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