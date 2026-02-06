import {timeline, Timeline} from "./timeline";
import {interpolator, Interpolator} from "./interpolator";
import {Path} from "../path";
import {animationEngine} from "./animation-engine";
import {EasingFunction} from "./common";

export type AnimatedPathFunction = (tl: Timeline, interpolate: Interpolator) => Path;

export function animatePath(pathFunc: AnimatedPathFunction, duration: number, easing?: EasingFunction) {
    const engine = animationEngine(duration, easing);
    const tl = timeline(engine.clock);
    const interpolate = interpolator(engine.clock);
    const paths: Path[] = [];
    while (engine.isRunning()) {
        paths.push(pathFunc(tl, interpolate));
        engine.tick();
    }
    return paths;
}