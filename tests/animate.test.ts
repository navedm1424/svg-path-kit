import {describe, expect, it} from "vitest";
import {cubicBezierEasing, easeIn} from "../src/animate/easing.js";
import {createTimeline} from "../src/animate/timeline.runtime.js";
import {createInterpolator} from "../src/animate/interpolator.runtime.js";
import {type AnimationClock, createFrameRenderer} from "../src/animate/frame-renderer.js";
import {PathBuilder} from "../src/path-builder.js";
import {Point2D} from "../src/point2D.js";
import {Sequence} from "../src/animate/sequence.js";
import {Segment} from "../src/animate/segment.js";

describe("easing", () => {
    describe("cubicBezierEasing", () => {
        it("returns function", () => {
            const e = cubicBezierEasing(0.42, 0, 1, 1);
            expect(typeof e).toBe("function");
            expect(e.name).toBe("cubic-bezier(0.42, 0, 1, 1)");
        });
        it("at t=0 returns 0, at t=1 returns 1", () => {
            const e = cubicBezierEasing(0.42, 0, 0.58, 1);
            expect(e(0)).toBe(0);
            expect(e(1)).toBe(1);
        });
        it("linear when control points on diagonal", () => {
            const e = cubicBezierEasing(0.5, 0.5, 0.5, 0.5);
            expect(e(0)).toBe(0);
            expect(e(0.5)).toBe(0.5);
            expect(e(1)).toBe(1);
        });
        it("saturates input control points", () => {
            const e = cubicBezierEasing(2, 0, -1, 1);
            expect(e(0.5)).toBeGreaterThanOrEqual(0);
            expect(e(0.5)).toBeLessThanOrEqual(1);
        });
    });
});

describe("Segment", () => {
    it("constructor normalizes start > end", () => {
        const seg = new Segment(1, 0);
        expect(seg.start).toBe(0);
        expect(seg.end).toBe(1);
        expect(seg.duration).toBe(1);
    });
    it("saturates to [0, 1]", () => {
        const seg = new Segment(-1, 2);
        expect(seg.start).toBe(0);
        expect(seg.end).toBe(1);
    });
    it("from(start).to(end)", () => {
        const seg = Segment.from(0.2).to(0.8);
        expect(seg.start).toBe(0.2);
        expect(seg.end).toBe(0.8);
        expect(seg.duration).toBeCloseTo(0.6);
    });
    it("from(start).ofDuration(d)", () => {
        const seg = Segment.from(0.2).ofDuration(0.3);
        expect(seg.start).toBe(0.2);
        expect(seg.end).toBe(0.5);
    });
});

describe(`${Sequence.name}`, () => {
    it("is frozen", () => {
        expect(Object.isFrozen(Sequence)).toBe(true);
    });
    describe(`${Sequence.name}.prototype`, () => {
        it("is frozen", () => {
            expect(Object.isFrozen(Sequence.prototype)).toBe(true);
        });
    });
    describe(`${Sequence.fromRatios.name}()`, () => {
        it("creates an ordered sequence", () => {
            const seq = Sequence.fromRatios(["a", 1], ["b", 1], ["c", 1])
                .scaleToRange(0, 1);
            expect(seq.length).toBe(3);
            expect(seq.start).toBe(0);
            expect(seq.end).toBe(1);
            expect(seq[0]).toBeDefined();
            expect(seq[1]).toBeDefined();
            expect(seq[2]).toBeDefined();
            expect(seq[0]).toBe(seq.segments.a);
            expect(seq[1]).toBe(seq.segments.b);
            expect(seq[2]).toBe(seq.segments.c);
            expect(seq instanceof Sequence).toBe(true);
        });
        it("returns a frozen object", () => {
            const seq = Sequence.fromRatios(["a", 1], ["b", 1]).scaleToRange(0, 1);
            expect(Object.isFrozen(seq)).toBe(true);
        });
        it("errors out on inputs of incorrect type", () => {
            expect(() => {
                // @ts-expect-error
                Sequence.fromRatios({"a": 1});
            }).toThrow();
            expect(() => {
                // @ts-expect-error
                Sequence.fromRatios([2, "b"]);
            }).toThrow();
        });
        it("errors out on empty inputs", () => {
            expect(() => {
                // @ts-expect-error
                Sequence.fromRatios().scaleToRange(0, 1);
            }).toThrow();
        });
        it("exposes named segments of the provided durations", () => {
            const seq = Sequence.fromRatios(["a", 2], ["b", 1])
                .scaleToRange(0.25, 0.75);
            expect(seq.segments.a).toBeDefined();
            expect(seq.segments.b).toBeDefined();
            expect(seq.segments.a).toBeInstanceOf(Segment);
            expect(seq.segments.b).toBeInstanceOf(Segment);
            expect(seq.segments.a.duration).toBeCloseTo(2 * seq.segments.b.duration);
        });
        it("scales to the provided range", () => {
            const seq = Sequence.fromRatios(["a", 1], ["b", 1])
                .scaleToRange(0.25, 0.75);
            expect(seq.start).toBe(0.25);
            expect(seq.end).toBe(0.75);
            const {a, b} = seq.segments;
            expect(a.end).toBe(0.5);
            expect(b.start).toBe(0.5);
            expect(a.duration).toBe(0.25);
            expect(b.duration).toBe(0.25);
        });
        it("applies Math.abs to negative inputs", () => {
            const seq = Sequence.fromRatios(["a", 1], ["b", -1])
                .scaleToRange(0.25, 0.75);
            expect(seq.length).toBe(2);
            expect(seq.start).toBe(0.25);
            expect(seq.end).toBe(0.75);
        });
    });
    describe(`instanceof ${Sequence.name}`, () => {
        it(`is false for any object not created with ${Sequence.name}.${Sequence.fromRatios.name}()`, () => {
            const fake = Object.create(Sequence.prototype, {
                length: { value: 10 },
                segments: { value: { a: Segment.from(0.4).to(0.6) } }
            });
            expect(fake instanceof Sequence).toBe(false);
            const clone = structuredClone(Sequence.fromRatios(["a", 1]).scaleToRange(0, 1));
            expect(clone instanceof Sequence).toBe(false);
        });
    });
    describe(`${Sequence.prototype.subsequence.name}`, () => {
        const seq = Sequence.fromRatios(["a", 1], ["b", 1], ["c", 1], ["d", 1])
            .scaleToRange(0, 1);
        it("returns an end-inclusive subsequence", () => {
            const sub = seq.subsequence(1, 2);
            expect(sub.length).toBe(2);
            // @ts-expect-error
            expect(sub.segments.a).toBeUndefined();
            expect(sub.segments.b).toBeDefined();
            expect(sub.segments.c).toBeDefined();
            expect(sub.segments.b).toBe(seq.segments.b);
            expect(sub.segments.c).toBe(seq.segments.c);
        });
        it("returns a subsequence by both index and name", () => {
            const sub = seq.subsequence("b", 2);
            expect(sub.length).toBe(2);
            // @ts-expect-error
            expect(sub.segments.a).toBeUndefined();
            expect(sub.segments.b).toBeDefined();
            expect(sub.segments.c).toBeDefined();
        });
    });
    it("toArray returns segments", () => {
        const seq = Sequence.fromRatios(["x", 1]).scaleToRange(0.25, 0.75);
        const arr = seq.toArray();
        expect(arr.length).toBe(1);
        expect(arr[0]!.start).toBe(seq.segments.x.start);
        expect(arr[0]!.end).toBe(seq.segments.x.end);
    });
});

describe("Timeline", () => {
    it("createTimeline returns function", () => {
        const clock = { time: 0.5 };
        const tl = createTimeline(clock);
        expect(typeof tl).toBe("function");
        expect(tl.time).toBe(clock.time);
    });
    it("tl(segment) hasStarted / hasFinished / isActive", () => {
        const segment = new Segment(0.2, 0.8);
        let time = 0.1;
        const clock: AnimationClock = { get time() { return time; } };
        const tl = createTimeline(clock);
        const stateBefore = tl(segment);
        expect(stateBefore.hasStarted()).toBe(false);
        expect(stateBefore.hasFinished()).toBe(false);
        expect(stateBefore.isActive()).toBe(false);

        time = 0.5;
        const stateDuring = tl(segment);
        expect(stateDuring.hasStarted()).toBe(true);
        expect(stateDuring.hasFinished()).toBe(false);
        expect(stateDuring.isActive()).toBe(true);

        time = 0.9;
        const stateAfter = tl(segment);
        expect(stateAfter.hasStarted()).toBe(true);
        expect(stateAfter.hasFinished()).toBe(true);
        expect(stateAfter.isActive()).toBe(false);
    });
    it("tl(sequence) works", () => {
        const seq = Sequence.fromRatios(["a", 1]).scaleToRange(0.25, 0.75);
        const clock = { time: 0.5 };
        const state = createTimeline(clock)(seq);
        expect(state.hasStarted()).toBe(true);
        expect(state.isActive()).toBe(true);
        expect(state.hasFinished()).toBe(false);
    });
    it("throws when argument is not Segment or Sequence", () => {
        const tl = createTimeline({ time: 0 });
        expect(() => tl(null as any)).toThrow();
        expect(() => tl(42 as any)).toThrow();
        expect(() => tl({} as any)).toThrow("segment or a sequence");
    });
});

describe("Interpolator", () => {
    it("createInterpolator returns interpolator", () => {
        const clock = {time: 0.5};
        const map = createInterpolator(clock);
        expect(map.time).toBe(clock.time);
        expect(typeof map.segment).toBe("function");
        expect(typeof map(new Segment(0, 1))).toBe("object");
    });
    it("map(segment).to(start, end) remaps time", () => {
        const segment = new Segment(0.2, 0.8);
        const clock = { time: 0.5 };
        const map = createInterpolator(clock);
        const value = map(segment).to(100, 200);
        expect(value).toBeCloseTo(150);
    });
    it("map.segment(segment).withEasing(easing).to() applies easing", () => {
        const segment = new Segment(0, 1);
        const clock = { time: 0.5 };
        const map = createInterpolator(clock);
        const linear = map.segment(segment).to(0, 100);
        const eased = map.segment(segment).withEasing(easeIn).to(0, 100);
        expect(linear).toBe(50);
        expect(eased).not.toBe(50);
        expect(eased).toBeGreaterThanOrEqual(0);
        expect(eased).toBeLessThanOrEqual(100);
    });
    it("map.easeIn(segment).to()", () => {
        const segment = new Segment(0, 1);
        const map = createInterpolator({ time: 0.5 });
        const v = map.easeIn(segment).to(0, 10);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(10);
    });
    it("map.sequence(seq).to(anchors)", () => {
        const seq = Sequence.fromRatios(["a", 1], ["b", 1]).scaleToRange(0, 1);
        const clock = { time: 0.5 };
        const map = createInterpolator(clock);
        const v = map.sequence(seq).to(0, 50, 100);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
    });
    it("map.sequence(seq).to() wrong anchor count throws", () => {
        const seq = Sequence.fromRatios(["a", 1], ["b", 1]).scaleToRange(0, 1);
        const map = createInterpolator({ time: 0.5 });
        // @ts-expect-error
        expect(() => map.sequence(seq).to(0, 100)).toThrow("exactly 3");
    });
    it("throws on invalid sequence", () => {
        const map = createInterpolator({ time: 0 });
        expect(() => map.sequence(null as any)).toThrow();
    });
});

describe("FrameRenderer", () => {
    const renderer = createFrameRenderer((tl, map) => {
        const pb = PathBuilder.m(Point2D.of(0, 0));
        pb.l(Point2D.of(100 * tl.time, 0));
        return pb.toSVGPathString();
    });
    it(`${renderer.renderFrameAt.name} returns Frame`, () => {
        const path0 = renderer.renderFrameAt(0);
        expect(path0.time).toBe(0);
        expect(path0.value).toBe("M 0 0 L 0 0");
        const path1 = renderer.renderFrameAt(1);
        expect(path1.time).toBe(1);
        expect(path1.value).toBe("M 0 0 L 100 0");
    });
    it(`${renderer.renderFrames.name} returns Frames with duration and fps`, () => {
        const frames = renderer.renderFrames({ duration: 5 });
        expect(Array.isArray(frames)).toBe(true);
        expect(frames.duration).toBe(5);
        expect(frames.fps).toBe(60);
        expect(frames.length).toBe(300);
        expect(frames[0]).toMatch(/M\s+0\s+0/);
    });
    it("exportToJson in Node writes JSON file", async () => {
        const animated = createFrameRenderer((_, __) => {
            const pb = PathBuilder.m(Point2D.ORIGIN);
            pb.l(Point2D.of(10, 0));
            return pb.toSVGPathString();
        });
        const frames = animated.renderFrames({ duration: 1 });
        const outPath = await frames.exportToJson("test-output-animate", "frames");
        expect(outPath).toMatch(/frames\.json$/);
        const fs = await import("fs");
        const data = JSON.parse(fs.readFileSync(outPath, "utf8"));
        expect(data.frames).toBeDefined();
        expect(data.fps).toBe(60);
        fs.rmSync("test-output-animate", { recursive: true, force: true });
    });
    it("exportToJson in Node writes JSON file", async () => {
        const animated = createFrameRenderer((_, __) => {
            const pb = PathBuilder.m(Point2D.ORIGIN);
            pb.l(Point2D.of(10, 0));
            return pb.toSVGPathString();
        });
        const outPath = await animated.renderFrameAt(0).exportToJson("test-output-path", "path-export");
        expect(outPath).toMatch(/path-export\.json$/);
        const fs = await import("fs");
        const content = fs.readFileSync(outPath, "utf8");
        const data = JSON.parse(content);
        expect(data.frame).toBeDefined();
        expect(typeof data.frame).toBe("string");
        fs.rmSync("test-output-path", { recursive: true, force: true });
    });
});
