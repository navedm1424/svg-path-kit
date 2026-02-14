import type {AnimationClock} from "./animated-path";
import type {Sequence} from "./sequence";
import type {Segment} from "./segment";

export type Timeline = {
    readonly animationClock: AnimationClock;
    (segment: Segment): {
        hasStarted(): boolean;
        hasFinished(): boolean;
        isActive(): boolean;
    };
    (sequence: Sequence<string[]>): {
        hasStarted(): boolean;
        hasFinished(): boolean;
        isActive(): boolean;
    };
};