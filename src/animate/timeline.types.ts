import type {Sequence} from "./sequence.ts";
import type {Segment} from "./segment.ts";

export interface Timeline {
    get time(): number;
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
}