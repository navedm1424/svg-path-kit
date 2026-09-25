# Library audit

Scan of `src/` for wrong results, floating-point noise, and performance problems. Every item under "Verified" was reproduced by running the code.

## Wrong results (verified)

1. **Shared `Vector2D.NULL_VECTOR` can be mutated.**
   `normalize()` on a zero vector and a move command's velocity both return it, and `scale()`/`rotate()` mutate in place. After `.scale(-1).rotate(1)` its angle went from 0 to 4.14 for the whole process. `fitCubicBezier` reaches this through `v0Unit.scale(s0)`.
   Fix: make `NULL_VECTOR` a getter that returns a fresh zero vector (about 3 lines).

2. **`HandleDefinedCubicBezierCurve` start and end velocities are swapped.**
   The start velocity came out as `(0,-15)` and should be `(3,0)`; the end velocity is the reverse. This class also skips `makePropertiesReadonly`.
   Fix: swap the two bodies and add the readonly call.

3. **`EllipticalArcCommand` gets the large-arc flag wrong for negative sweeps.**
   A -270° arc emits `large=0`.
   Fix: `Math.abs(angleDiff) > Math.PI` (one token).

4. **`fitSplineInSteps` drops the last segment.**
   It accumulates the step and stops within an absolute `1e-4` of `t1`, so `steps=20000` returns 19999 segments.
   Fix: an index loop, `t0 + range * i / steps`, which `cubicBezierFitRadialError` already uses.

5. **`PathBuilder.currentPosition` swallows every error.**
   Its `try/catch` turned a double `z()` into a silent `(0,0)`. The constructor also has two identical `if/else` branches.
   Fix: `this.#commands.at(-1)?.terminalPoint ?? Point2D.ORIGIN`, plus a clear error when `z()` has no open subpath.

## Noise, the same class as `round`

6. **`sin`/`cos` are not exact at quarter turns.**
   `polar(1, Math.PI/2).x` is `6.1e-17`, and `Superellipse` amplifies that to about `8e-9`.
   Fix: in `Angle`, use exact quadrant values only when `v === n * (π/2)` (about 8 lines). Verified identical to `Math.sin`/`Math.cos` on 100,000 random inputs; costs 0.065 µs against 0.048 µs. It treats `Math.PI` as π.

7. **`Angle.wrap()` disturbs in-range values.**
   `wrap(0.1)` gives `0.09999999999999964`, and `wrap(1)` does the same.
   Fix: return the value unchanged when it is already in range (verified for `0.1`).

8. **`findCriticalTs` de-duplicates by rounding to `1e-8`.** (Found by reading, not run.)
   Two roots on either side of a rounding boundary stay separate.
   Fix: sort, then drop values within `1e-8` of the previous one.

## Performance (verified)

9. **`Vector2D.of` costs about 2.9 µs.**
   Every construction eagerly computes `hypot`, `atan2`, `sin` and `cos`, and `findRoots` builds thousands of them.
   Fix: compute `length` and `angle` on first access (about 10 lines).

## Needs a decision

- **`CubicBezierEllipticalArc` uses one cubic for any sweep.**
  Max radial error: `2.7e-4` at 90°, `1.8%` at 180°, `27.6%` at 270°, `6e15` at 360°.
  Either throw above a limit, or split into segments of at most 90° (changes the API).
- **Degenerate `A` commands produce NaN.**
  `EllipticalArcWrapperCommand` gives NaN when a radius is 0 or the endpoints coincide. The SVG spec says a zero radius is a straight line and identical endpoints omit the arc, so the command's representation needs a decision.

## Small cleanups

- 11 `@ts-expect-error` comments in `PathBuilder`.
- `1e-8` defined twice and `1e-4` hard-coded four times.
- `superellipse.ts` imports from the barrel `../index.js`, and its `n` parameter (exponent `2^(1-n)`) is undocumented.
- `criciticalPoints` typo in `spline-fitting.ts`.

## Checked and fine

- The default numerical `accelerationAt` is off by only `3e-5` at magnitude 1000.
- Degrees round-trip noise (38 of 361 integer degrees) comes from storing radians. A "multiply first" fix was worse (336 failures against 166 over -720 to 720), and SVG output already rounds.
