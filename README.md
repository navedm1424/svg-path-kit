## SVG Path Kit

A small, composable TypeScript library for building complex SVG path strings using a high‑level, geometry‑oriented API.

Instead of manually concatenating SVG path commands, you work with `Point2D`, `Vector2D`, Bézier helpers, and a fluent `PathBuilder` that outputs a valid `d` attribute for `<path>` elements.

<br/><br/>

## Installation

```bash
npm install svg-path-kit
# or
yarn add svg-path-kit
# or
pnpm add svg-path-kit
```

The library is written in TypeScript and ships with type definitions.

<br/><br/>

## Points and Vectors


The library models 2D geometry explicitly:

- **`Point2D`**: an absolute position in 2D space
- **`Vector2D`**: a displacement with direction and magnitude

<br/>

### 2D Point

#### Static Factory
**`static of(x: number, y: number): Point2D`** — creates a 2D point at given coordinates
```ts
const point: Point2D = Point2D.of(5, 2);
```
<br/>

#### Properties

- `x: number` — X coordinate (read‑only)
- `y: number` — Y coordinate (read‑only)

<br/>

#### Methods

**`add(vector: Vector2D): Point2D`** — translates the point by a 2D vector
```ts
const translatedPoint: Point2D = point.add(Vector2D.of(3, -3));
```
---
**`toVector(): Vector2D`** — converts the point to a vector from the origin
```ts
const vector: Vector2D = point.toVector();
```
<br/>

### 2D Vector

#### Static Factories

**`static of(x: number, y: number)`** — creates a vector from coordinates
```ts
const vector: Vector2D = Vector2D.of(2, 3);
```
---
**`static ofAngle(angle: number)`** — creates a unit vector at angle (radians) from the x-axis
```ts
// unit vector at 45 degrees from the x-axis
const vectorAtAngle: Vector2D = Vector2D.ofAngle(Math.PI / 4);
```
---
**`static from(initial: Point2D, terminal: Point2D)`** — creates a vector from one point to another
```ts
const a = Point2D.of(7, 7);
const b = Point2D.of(8, 8);
const vectorFromAToB = Vector2D.from(a, b);
// equivalent to Vector2D.of(1, 1)
```
<br/>

#### Properties

- `x: number` — X component
- `y: number` — Y component
- `magnitude: number` — Length of the vector — `Math.hypot(x, y)`
- `slope: number` — `y / x` (⚠ undefined for `x = 0`)

<br/>

#### Non-mutating Methods

**`add(vector: Vector2D): Vector2D`** — performs vector addition
```ts
const vectorA: Vector2D = Vector2D.of(1, 2);
const vectorB: Vector2D = Vector2D.of(2, 1);
// (aX + bX, aY + bY) = (1 + 2, 2 + 1) = (3, 3);
const vectorC: Vector2D = vectorA.add(vectorB);
```
---
**`subtract(vector: Vector2D): Vector2D`** — performs vector subtraction
```ts
const vectorA: Vector2D = Vector2D.of(1, 2);
const vectorB: Vector2D = Vector2D.of(2, 1);
// (aX - bX, aY - bY) = (1 - 2, 2 - 1) = (-1, 1);
const vectorC: Vector2D = vectorA.subtract(vectorB);
```
---
**`multiply(scalar: number): Vector2D`** — performs scalar multiplication
```ts
const vector: Vector2D = Vector2D.of(1, 2);
// (scalar * x, scalar * y) = (2 * 1, 2 * 2) = (2, 4);
const scaledVector: Vector2D = vector.multiply(2);
```
---
**`dotProduct(vector: Vector2D): number`** — returns the dot product
```ts
const vectorA: Vector2D = Vector2D.of(1, 2);
const vectorB: Vector2D = Vector2D.of(2, 1);
const dotProduct: number = vectorA.dotProduct(vectorB);
```
---
**`crossProduct(vector: Vector2D): number`** — returns the scalar Z‑component of the 3D cross product
```ts
const vectorA: Vector2D = Vector2D.of(1, 2);
const vectorB: Vector2D = Vector2D.of(2, 1);
// scalar z-component
const crossProduct: number = vectorA.crossProduct(vectorB);
```
---
**`unit(): Vector2D`** — returns the normalized vector (or `Vector2D.NULL_VECTOR` if magnitude is 0)
```ts
const vector: Vector2D = Vector2D.of(1, 2);
// normalized vector (Vector2D.NULL_VECTOR if magnitude is 0)
const unitVector: Vector2D = vector.unit();
```
---
**`perpendicular(direction?: RotationDirection): Vector2D`** — returns the perpendicular vector

`enum RotationDirection` specifies the direction of rotation for perpendicular vectors:
* `CLOCKWISE`
* `COUNTERCLOCKWISE` (default)
```ts
const vector: Vector2D = Vector2D.of(1, 2);
// perpendicular vector, counterclockwise
const counterClockwisePerp: Vector2D = vector.perpendicular();
// perpendicular vector, clockwise
const clockwisePerp: Vector2D = vector.perpendicular(RotationDirection.CLOCKWISE);
```
> Note: This method may be removed due to ambiguities caused by SVG’s coordinate system.
SVG uses a top-left origin with a downward-increasing y-axis, which inverts orientation semantics compared to the conventional mathematical Cartesian system. As a result, clockwise and counterclockwise perpendiculars appear reversed relative to standard expectations.
Perpendicular vectors can instead be obtained explicitly using the rotate method with angles of `±Math.PI / 2`, avoiding this ambiguity.
---
**`opposite(): Vector2D`** — returns the negated vector
```ts
const vector: Vector2D = Vector2D.of(5, 6);
// (-1 * x, -1 * y) = (-1 * 5, -1 * 6) = (-5, -6)
const oppositeVector: Vector2D = vector.opposite();
```
---
**`clone(): Vector2D`** — returns an identical copy
```ts
const vector: Vector2D = Vector2D.of(1, 2);
const vectorClone: Vector2D = vector.clone();
```
---
**`toPoint(): Point2D`** — converts the vector to a point relative to the origin
```ts
const vector: Vector2D = Vector2D.of(1, 2);
// equivalent to Point2D.of(1, 2);
const point: Point2D = vector.toPoint();
```
<br/>

#### Mutating Methods

**`scale(scalar: number): void`** — scales the vector in place and updates magnitude
```ts
const vector: Vector2D = Vector2D.of(1, 2);
vector.scale(2); // mutated to (2, 4);
```
---
**`rotate(angle: number): void`** — rotates the vector by the given angle (radians) around the origin
```ts
const vector: Vector2D = Vector2D.of(1, 2);
// (x * cos(angle) - y * sin(angle), x * sin(angle) + y * cos(angle))
vector.rotate(Math.PI / 2); // mutated to (-4, 2)
```

<br/><br/>

## Path Model

### 2. Commands and Paths

The library models an SVG path as a list of strongly‑typed command objects.

- **`Command` (abstract)**
  - Base class for individual SVG commands.
  - Each command has a **mode**: `'relative'` or `'absolute'`.
  - **Methods**:
    - `toString(): string` – SVG path segment (e.g. `"c 10 0 20 10 30 0"`).
    - `getEndPoint(): Point2D` – absolute end point of the command.

Concrete command types:

- **`MoveCommand`** – `M` / `m`
- **`LineCommand`** – `L` / `l`
- **`QuadraticBezierCurveCommand`** – `Q` / `q`
- **`CubicBezierCurveCommand`** – `C` / `c`
- **`EllipticalArcCommand`** – `A` / `a`
- **`ClosePathCommand`** – `Z` / `z`

You usually don’t instantiate these directly; you build them via `PathBuilder`.

#### `Path`

- **`new Path(commands: Command[])`** – wrap an array of commands.
- **`toString(): string`** – join command strings into a full SVG `d` attribute.

Example of consuming a built path:

```ts
import { PathBuilder } from 'svg-path-kit';
import { Point2D, Vector2D } from 'svg-path-kit';

const pathBuilder = PathBuilder.M(Point2D.of(0, 0))
  .l(Vector2D.of(100, 0))
  .l(Vector2D.of(0, 100))
  .z();

const d = pathBuilder.toString();
// <path d={d} /> in your SVG
```

---

## PathBuilder: Fluent SVG Path Construction

`PathBuilder` is the main entry point for building complex SVG paths. It manages the current point, stacks of open subpaths, and provides high‑level methods for lines, curves, arcs, and auto‑controlled Béziers.

### Creating a builder

- **Relative start**: `PathBuilder.m(vector: Vector2D)` – start a path with a relative move from `(0, 0)`.
- **Absolute start**: `PathBuilder.M(point: Point2D)` – start a path at an absolute point.

Internally both static methods call a private constructor and push a `MoveCommand`.

### State accessors

- **`currentPosition: Point2D`** – absolute current endpoint (origin if no commands yet).
- **`lastCommand: Command | null`** – last appended command or `null`.

`currentPosition` is especially useful when you have built up parts of the path with **relative** commands and you want to:

- Capture the absolute position you have reached, and/or
- Later construct new segments **relative to that stored point**, even when you are no longer adjacent to it in the command sequence.

Example – capture an absolute point from relative movement and reuse it later:

```ts
import { PathBuilder, Point2D, Vector2D } from 'svg-path-kit';

const builder = PathBuilder.M(Point2D.of(10, 10))
  .l(Vector2D.of(50, 0))     // move relatively
  .l(Vector2D.of(0, 40));    // move relatively again

const corner = builder.currentPosition; // absolute Point2D(60, 50)

// ... build more of the path elsewhere ...
builder.l(Vector2D.of(20, 0));

// later, build something relative to `corner`, even though
// the currentPosition has moved on:
const offset = Vector2D.of(0, -20);
const target = corner.add(offset);
builder.L(target); // absolute line back near that stored corner

const d = builder.toString();
```

Because `currentPosition` is a `Point2D`, you can combine it with `Vector2D` operations (`Vector2D.from`, `add`, `subtract`, `rotate`, etc.) to derive new absolute points and then use `L`, `CForCircularArc`, `CAutoControl`, or other absolute commands relative to those computed positions.

### Move commands

- **`m(point: Vector2D): this`** – relative `m` from `currentPosition`.
- **`M(point: Point2D): this`** – absolute `M` to a point, computed as a vector from `currentPosition`.

Every `m`/`M` opens a new subpath; the **first** move in each is remembered so you can close it later with `z()`.

### Line commands

- **`l(point: Vector2D): this`** – relative `l` from current point.
- **`L(point: Point2D): this`** – absolute `L`.

This is the simplest way to build polylines.

### Quadratic Bézier commands

- **`q(controlPoint: Vector2D, endPoint: Vector2D): this`** – relative `q`.
- **`Q(controlPoint: Point2D, endPoint: Point2D): this`** – absolute `Q` (automatically converted into relative vectors internally).

### Cubic Bézier commands

- **`c(firstControlPoint: Vector2D, secondControlPoint: Vector2D, endPoint: Vector2D): this`** – relative `c`.
- **`C(firstControlPoint: Point2D, secondControlPoint: Point2D, endPoint: Point2D): this`** – absolute `C`.

You typically use these when you know exact control points. For smoother authoring, see auto‑control curves below.

### Elliptical arc commands

Direct wrappers around SVG `A` / `a` commands:

- **Relative**: `a(xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint: Vector2D)`
- **Absolute**: `A(xRadius, yRadius, xAxisRotation, largeArcFlag, sweepFlag, endPoint: Point2D)`

These generate true SVG elliptical arcs.

---

## High‑Level Geometry Helpers

Beyond raw commands, the library provides geometry‑aware helpers that turn arcs and tangents into high‑quality cubic Bézier segments.

### 1. Circular Arc as Cubic Bézier

Use these when you want the visual shape of a circular arc but prefer cubic Bézier segments (e.g. for uniform curve handling or animation).

In `PathBuilder`:

- **Relative** `cForCircularArc` (overloads):
  - `cForCircularArc(angle: number, endingPoint: Vector2D): PathBuilder`
  - `cForCircularArc(center: Vector2D, angle: number): PathBuilder`

- **Absolute** `CForCircularArc` (overloads):
  - `CForCircularArc(angle: number, endingPoint: Point2D): PathBuilder`
  - `CForCircularArc(center: Point2D, angle: number): PathBuilder`

Example – build a path that contains a circular arc segment:

```ts
import { PathBuilder, Point2D, Vector2D } from 'svg-path-kit';

const d = PathBuilder.M(Point2D.of(0, 0))
  .l(Vector2D.of(50, 0))
  // 90° circular arc, expressed as a cubic Bézier
  .cForCircularArc(Math.PI / 2, Vector2D.of(50, 50))
  .l(Vector2D.of(0, 50))
  .z()
  .toString();
```

Under the hood these helpers call the lower‑level `cubicBezierCurveForCircularArc` utility, which computes control points so the Bézier approximates the exact circular arc.

### 2. Elliptical Arc as Cubic Bézier

When you want an elliptical arc with separate radii and rotation, use:

- **Low‑level**:
  - `cubicBezierCurveForEllipticalArc(center: Point2D, startingPoint: Point2D, centralAngle: number, ratio: number, phi: number): CubicBezierCurve`
    - `ratio` is the axis ratio \(a/b\) for the ellipse.
    - `phi` is the rotation of the ellipse in radians.

- **PathBuilder integration**:
  - **Relative**: `cForEllipticalArc(center: Vector2D, angle: number, axisRatio: number, ellipseRotation?: number)`
  - **Absolute**: `CForEllipticalArc(center: Point2D, angle: number, axisRatio: number, ellipseRotation?: number)`

These compute a cubic Bézier curve that follows the given elliptical arc, using parametric ellipse math and derivatives for smooth tangents.

### 3. Auto‑Controlled Cubic Bézier (Smooth Connections)

To avoid manually guessing control points for smooth joins, the library offers an **auto‑control** helper.

#### High‑level: `PathBuilder.cAutoControl` / `CAutoControl`

These wrap the lower‑level `cubicBezierAutoControl` helper and integrate with the builder state:

- **Relative**: `cAutoControl(
    endingPoint: Vector2D,
    startAngle?: number,
    endAngle?: number,
    curvatureA: number = 1/3,
    curvatureB: number = curvatureA
  )`

- **Absolute**: `CAutoControl(
    endingPoint: Point2D,
    startAngle?: number,
    endAngle?: number,
    curvatureA: number = 1/3,
    curvatureB: number = curvatureA
  )`

Behavior:

- **Angles to tangents**: if `startAngle` / `endAngle` are provided, they’re converted to unit direction vectors.
- **Automatic start direction**: if `startAngle` is omitted, the start direction is inferred from:
  - the last line segment’s direction, or
  - the last cubic/quadratic segment’s tangent into its endpoint.
- **Automatic end direction**: if `endAngle` is omitted, the direction is inferred based on the chord between current point and target.

This allows you to write code like:

```ts
const d = PathBuilder.M(Point2D.of(0, 0))
  .l(Vector2D.of(50, 0))
  .cAutoControl(Vector2D.of(50, 50)) // smooth curve continuing from the line
  .cAutoControl(Vector2D.of(0, 50))  // another smooth curve
  .toString();
```

You get visually smooth transitions without hand‑tuning control points.

---

## Working with `CubicBezierCurve`

The `CubicBezierCurve` class (used by the helpers above) exposes utilities for geometry‑based workflows:

- **Constructor**:
  - `new CubicBezierCurve(startingPoint, firstControlPoint, secondControlPoint, endingPoint)`
- **`getPointAt(t: number): Point2D`** – position on the curve for \(0 \le t \le 1\).
- **`getTangentAt(t: number): Vector2D`** – tangent vector at that parameter.
- **`splitAt(t: number, side: 'left' | 'right' = 'left'): CubicBezierCurve`** – split the curve using De Casteljau’s algorithm:
  - `'left'` – returns the first segment from \(t=0\) to given \(t\).
  - `'right'` – returns the trailing segment, translated so its start is at the origin.

These methods are useful for:

- Parametric animation along the curve
- Collision or hit‑testing
- Splitting and trimming path segments

---

## Closing Paths and Exporting

After constructing your commands with `PathBuilder`:

- **`z()`** – close the current subpath by emitting a `ClosePathCommand` that connects back to the last move (`m`/`M`) in the open stack.
- **`toPath()`** – wrap the internal command list into a `Path` instance.
- **`toString()`** – stringify to an SVG `d` string.

Example:

```ts
const builder = PathBuilder.M(Point2D.of(10, 10))
  .l(Vector2D.of(100, 0))
  .l(Vector2D.of(0, 50))
  .z();

const d = builder.toString();
// d might look like: "M 10 10 l 100 0 l 0 50 z"
```

You can use `d` anywhere SVG expects a path definition.

---

## Practical Usage Patterns

Here are some general patterns you can build with this library, independent of any specific example:

- **Smooth strokes and ribbons**
  - Use `cAutoControl`/`CAutoControl` to create flowing, connected segments where the tangent direction is inferred from the previous segment.
- **Arcs and circular motion**
  - Replace raw SVG `A` commands with `cForCircularArc` / `CForCircularArc` if you want everything expressed as cubic Béziers (easier to analyze, animate, or sample).
- **Elliptical shapes and orbits**
  - Use `cForEllipticalArc` / `CForEllipticalArc` for elliptical trajectories with configurable axis ratios and rotation.
- **Geometric constructions**
  - Compose `Point2D` + `Vector2D` operations (add, rotate, scale, perpendiculars) to express geometry declaratively before converting it into commands.
- **Animation over time**
  - Drive input angles, lengths, and positions from an external interpolation system, then rebuild paths each frame using the same `PathBuilder` calls to get smooth, time‑varying shapes.

---

## TypeScript Support

- All public classes and functions ship with `.d.ts` declarations.
- Works smoothly in TS projects; you get autocomplete for:
  - `Point2D`, `Vector2D`, `RotationDirection`
  - `PathBuilder` and its full fluent API
  - `CubicBezierCurve` and the various arc / auto‑control helpers

---

## Summary of Public API

**Geometry**

- `Point2D.of(x, y)`
- `Vector2D.of(x, y)`
- `Vector2D.ofAngle(angle)`
- `Vector2D.from(initial, terminal)`
- `RotationDirection` enum

**Path construction**

- `PathBuilder.m(vector)` / `PathBuilder.M(point)`
- Instance methods:
  - `m`, `M`, `l`, `L`, `q`, `Q`, `c`, `C`, `a`, `A`
  - `cForCircularArc`, `CForCircularArc`
  - `cForEllipticalArc`, `CForEllipticalArc`
  - `cAutoControl`, `CAutoControl`
  - `z`, `toPath`, `toString`

**Cubic Bézier utilities**

- `CubicBezierCurve`
  - `getPointAt(t)`
  - `getTangentAt(t)`
  - `splitAt(t, side?)`
- `cubicBezierCurveForCircularArc(...)`
- `cubicBezierCurveForEllipticalArc(...)`
- `cubicBezierAutoControl(...)`

This is the toolkit you use to build precise, smooth, and expressive SVG paths in a fully programmatic way.