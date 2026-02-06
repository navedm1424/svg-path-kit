import {timeline, Timeline} from "./timeline";
import {interpolator, Interpolator} from "./interpolator";
import {Path} from "../path";
import {animationStepper} from "./animation-stepper";
import {EasingFunction} from "./common";

export type AnimatedPathFunction = (tl: Timeline, interpolate: Interpolator) => Path;

export function generateAnimatedPathFrames(pathFunc: AnimatedPathFunction, duration: number, easing?: EasingFunction) {
    const stepper = animationStepper(duration, easing);
    const tl = timeline(stepper.progress);
    const interpolate = interpolator(stepper.progress);
    const paths: Path[] = [];
    do {
        paths.push(pathFunc(tl, interpolate));
        stepper.step();
    } while (!stepper.progress.isComplete());
    return paths;
}