## SVG Path Kit

A small, composable TypeScript library for building complex SVG path strings using a high‑level, geometry‑oriented API.

Instead of manually concatenating SVG path commands, you work with `Point2D`, `Vector2D`, Bézier helpers, and a `PathBuilder` that outputs a valid `d` attribute for `<path>` elements.

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

## PathBuilder

`PathBuilder` is the main entry point for building complex SVG paths. It manages the current point, stacks of open subpaths, and provides high‑level methods for lines, curves, arcs, and auto‑controlled Béziers.

### Use Cases

Starting simple, let's draw a square:

```ts
import {PathBuilder, Point2D, Vector2D} from "svg-path-kit";

// move to point (7, 0)
const pb = PathBuilder.m(Point2D.of(7, 0))
// a line extending 0 units forward and 6 units downward
pb.l(Vector2D.of(0, 6))
// a line extending 6 units backward and 0 units upward
pb.l(Vector2D.of(-6, 0))
// a line extending 0 units forward and 6 units upward
pb.l(Vector2D.of(0, -6))
// close path
pb.z();

const d = pb.toString();
```

This creates the path data for a simple square:

![Square](https://raw.githubusercontent.com/navedm1424/svg-path-kit/ffecbb5c16116ceaa3828b5dcbdfb82d6be3caa2/assets/examples/square.svg)

---

#### Cubic Bézier Circular Arcs

One of the challenges while working with cubic Bézier curves is of drawing circular arcs. It requires you to calculate the control-point coordinates for a cubic Bézier curve that produce the closest approximations of a circular arc.

`PathBuilder` gives you a `bezierCircularArc` method that has three parameters:
- the radius of the circle
- the arc’s starting angle (in radians)
- the arc's ending angle (in radians)

Here's how easily you can do it:
```ts
import { PathBuilder, Point2D, Vector2D } from "svg-path-kit";

const pb = PathBuilder.m(Point2D.of(7, 0));
// a line extending 0 units forward and 6 units downward
pb.l(Vector2D.of(0, 6))
// a cubic Bézier curve approximating a 90° circular arc
pb.bezierCircularArc(
    3, // radius
    0, // starting at parametric angle 0
    Math.PI / 2 // ending at parametric angle π / 2 radians (90°)
)
// a cubic Bézier curve approximating a 90° circular arc
pb.bezierCircularArc(
    3, // radius
    Math.PI / 2, Math.PI // from parametric angle π / 2 to π radians (90° to 180°)
)
// a line extending 0 units forward and 6 units upward
pb.l(Vector2D.of(0, -6))
// close path
pb.z();

const d = pb.toString();
```

Here's the path data it produces:

```
M 7 0
L 7 6
C 7 7.6569 5.6569 9 4 9
C 2.3431 9 1 7.6569 1 6
L 1 0
Z
```

And here's the resulting shape:

![Round-capped Rectangle](https://raw.githubusercontent.com/navedm1424/svg-path-kit/ffecbb5c16116ceaa3828b5dcbdfb82d6be3caa2/assets/examples/roundcapped_rect.svg)

---

#### Cubic Bézier Elliptical Arcs

You can also draw elliptical arcs:

![Elliptical_Bean](https://raw.githubusercontent.com/navedm1424/svg-path-kit/ffecbb5c16116ceaa3828b5dcbdfb82d6be3caa2/assets/examples/elliptical_bean.svg)

This shape begins with a quarter elliptical arc, transitions into a quarter circular arc, followed by another quarter elliptical arc, and concludes with a quarter circular arc.

Here's the path data:
```
M 4 0
C 5.6569 0 7 2.2386 7 5
C 7 6.6569 5.6569 8 4 8
C 2.3431 8 1 5.7614 1 3
C 1 1.3431 2.3431 0 4 0
Z
```

And here's the code:

```ts
import { PathBuilder, Point2D } from "svg-path-kit";

const pb = PathBuilder.m(Point2D.of(4, 0));
// a quarter (90°) elliptical arc
pb.bezierEllipticalArc(
    3, // semi-major axis
    5, // semi-minor axis
    -Math.PI / 2, 0, // sweeping from -π / 2 to 0 radians (-90° to 0°) in parametric angle
);
// a 90° circular arc
pb.bezierCircularArc(
    3,
    0, Math.PI / 2 // sweeping from 0 to π / 2 radians (0° to 90°) in parametric angle
);
// a quarter (90°) elliptical arc
pb.bezierEllipticalArc(
    3,
    5,
    Math.PI / 2, Math.PI // sweeping from π / 2 to π radians (90° to 180°) in parametric angle
);
// a 90° circular arc
pb.bezierCircularArc(
    3,
    Math.PI, 3 * Math.PI / 2 // sweeping from π to 3π / 2 radians (180° to 270°) in parametric angle
);
// close path
pb.z();

const d = pb.toString();
```
---

#### Angled Lines & Command Referencing

Let's kick things up a notch. Let's draw the following golf club:

![Golf Club](https://raw.githubusercontent.com/navedm1424/svg-path-kit/ffecbb5c16116ceaa3828b5dcbdfb82d6be3caa2/assets/examples/golf_club.svg)

We start with an angled line extending, say, 8 units in the direction of the angle. It is followed by multiple circular arcs of different radii that form the clubhead; let's call them the head curves. We draw the right-edge line backwards to create the left edge of the shaft. We close the path with a round cap over the shaft. 

The shape has the following path data:

```
M 7 0.375
L 4.9294 8.1024
L 4.6706 9.0683
C 4.6052 9.3123 4.4146 9.5029 4.1706 9.5683
C 3.1533 9.8409 2.0821 9.8409 1.0648 9.5683
C 0.8208 9.5029 0.6302 9.3123 0.5648 9.0683
C 0.4221 8.5357 0.4221 7.9748 0.5648 7.4421
C 0.672 7.042 1.0833 6.8046 1.4834 6.9118
C 2.4963 7.1832 3.4693 7.5863 4.3775 8.1106
C 4.422 8.1363 4.4199 8.0721 4.4465 7.973
L 6.517 0.2456
C 6.5528 0.1122 6.6899 0.0331 6.8232 0.0688
C 6.9566 0.1045 7.0357 0.2416 7 0.375
Z
```

To draw an angled line, you can use the `Vector2D.polar(radius, angle)` method to create a vector with polar coordinates.

Also, the last head curve in this path must end half a unit away from the right edge of the shaft marking the shaft's thickness. The shaft is formed by the first two lines in the path. Since they are earlier in the command sequence, we cannot define a command relative to their endpoints.

To address this, every command class exposes a property called `terminalPoint`, which is the endpoint of the command. You can read this endpoint and add a vector to it that takes you half a unit away from the endpoint perpendicular to the line. You can specify the result as the endpoint of the last head curve.

This allows you to write commands relative to any previous command. `PathBuilder` also has properties like `lastCommand` and `currentPosition`—the endpoint of the last command—that allow you to do the same and more.

Here's how you would use these solutions to draw the above shape: 

```ts
import { LineCommand, PathBuilder, Point2D, Vector2D } from "svg-path-kit";

const shaftLength = 8;
const angle = Math.PI / 12;

const pb: PathBuilder = PathBuilder.m(Point2D.of(7, 0.375));

const shaftRightEdgeVector = Vector2D.polar(shaftLength, Math.PI / 2 + angle);
const shaftRightEdgeCommand: LineCommand = pb.l(shaftRightEdgeVector);
pb.l(Vector2D.polar(1, Math.PI / 2 + angle));

pb.bezierCircularArc(
    Math.SQRT1_2, angle, Math.PI / 2 - angle
);
pb.bezierCircularArc(
    6, Math.PI / 2 - angle, Math.PI / 2 + angle
);
pb.bezierCircularArc(
    Math.SQRT1_2, Math.PI / 2 + angle, Math.PI - angle
);
pb.bezierCircularArc(
    Math.PI, Math.PI - angle, Math.PI + angle
);
pb.bezierCircularArc(
    0.75, Math.PI, 3 * Math.PI / 2, angle
);
pb.bezierCircularArc(
    12, -Math.PI / 2 + angle, -Math.PI / 2 + 2 * angle
);

pb.cAutoControl(
    shaftRightEdgeCommand.terminalPoint.add(Vector2D.polar(0.5, angle + Math.PI)),
    2 * angle, Math.PI / 2 + angle,
    1 / 3, 2 / 3
);
pb.l(shaftRightEdgeVector.opposite());
pb.bezierCircularArc(
    0.25, Math.PI, 3 * Math.PI / 2, angle
);
pb.bezierCircularArc(
    0.25, 3 * Math.PI / 2, 2 * Math.PI, angle
);
pb.z();

const d = pb.toString();
```

<br/>

### API

#### Creating a builder

**Relative start**: `PathBuilder.m(vector: Vector2D)` – start a path with a relative move from `(0, 0)`.
```ts
PathBuilder.m(Vector2D.of(2, 3));
```
**Absolute start**: `PathBuilder.m(point: Point2D)` – start a path at an absolute point.
```ts
PathBuilder.m(Point2D.of(2, 3));
```
---

#### State accessors

- `currentPosition: Point2D` – absolute current endpoint (origin if no commands yet).
- `lastCommand: Command` – last appended command.

`currentPosition` is especially useful when you have built up parts of the path with **relative** commands and you want to:

- Capture the absolute position you have reached, and/or
- Later construct new segments **relative to that stored point**, even when you are no longer adjacent to it in the command sequence.
---

#### Move commands

Direct wrappers around SVG `M` / `m` commands:

- `m(point: Point2D): MoveCommand` – move to an absolute point.
- `m(vector: Vector2D): MoveCommand` – move relative to the current position.
---
#### Line commands

Direct wrappers around SVG `L` / `l` commands:

- `l(point: Point2D): LineCommand` – line to an absolute point.
- `l(vector: Vector2D): LineCommand` – line to a point relative to the current position.
---
#### Quadratic Bézier commands

Direct wrappers around SVG `Q` / `q` commands:

- `q(controlPoint: Point2D, endingPoint: Point2D): QuadraticBezierCurveCommand` – absolute `Q`.
- `q(controlPointVector: Vector2D, endingPoint: Vector2D): QuadraticBezierCurveCommand` – relative `q`.
---
#### Cubic Bézier commands

Direct wrappers around SVG `C` / `c` commands:

- `c(firstControlPoint: Point2D, secondControlPoint: Point2D, endingPoint: Point2D): CubicBezierCurveCommand` – absolute `C`.
- `c(firstControlPointVector: Vector2D, secondControlPointVector: Vector2D, endingPointVector: Vector2D): CubicBezierCurveCommand` – relative `c`.
---
#### Elliptical arc commands

Direct wrappers around SVG `A` / `a` commands:

- `a(xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, endingPoint: Point2D): EllipticalArcCommand` - absolute
- `a(xRadius: number, yRadius: number, xAxisRotation: number, largeArcFlag: 0 | 1, sweepFlag: 0 | 1, endingPointVector: Vector2D): EllipticalArcCommand` - relative

---

Beyond raw commands, the library provides geometry‑aware helpers that turn arcs and tangents into high‑quality cubic Bézier segments.

#### Circular Arc as Cubic Bézier

- `bezierCircularArc(radius: number, startAngle: number, endAngle: number, rotation?: number): CubicBezierEllipticalArc`

#### Elliptical Arc as Cubic Bézier

- `bezierEllipticalArc(
        semiMajorAxis: number, semiMinorAxis: number,
        startAngle: number, endAngle: number,
        ellipseTilt?: number
    ): CubicBezierEllipticalArc`:

These compute a cubic Bézier curve that follows the given elliptical arc, using parametric ellipse math and derivatives for smooth tangents.

---
#### Auto‑Controlled Cubic Bézier

To avoid manually guessing control points for smooth joins, the library offers an **auto‑control** helper.

- `cAutoControl(endingPoint: Point2D, startAngle?: number, endAngle?: number, startHandleScale?: number, endHandleScale?: number): CubicBezierAutoControlCurveCommand` - absolute ending point
- `cAutoControl(endingPointVector: Vector2D, startAngle?: number, endAngle?: number, startHandleScale?: number, endHandleScale?: number): CubicBezierAutoControlCurveCommand` - relative ending point

if `startAngle` / `endAngle` are provided, they’re converted to unit direction vectors. Otherwise, the chord direction is used.

---
#### Appending Commands

All of these methods have corresponding command classes that you can instantiate and append into the path builder.
- `append<T extends Command>(command: T): T`

---

#### Closing Paths and Exporting

After constructing your commands with `PathBuilder`:

- `z()` – close the current subpath.
- `toPath()` – convert the internal commands into primitive SVG commands and return an `SVGPath` instance.
- `toString()` – stringify to an SVG `d` string.

---

#### The Command interface

Each method in `PathBuilder` has a corresponding command class that implements the command interface.
The interface has the following properties and functions:

- `readonly initialPoint: Point2D` – the point where the shape starts
- `readonly terminalPoint: Point2D` – the point where the shape ends

- `getStartVelocity(): Vector2D | undefined` – the starting tangent of the shape
- `getEndVelocity(): Vector2D | undefined` – the ending tangent of the shape
- `toSVGPathCommand(): PrimitiveCommand` – returns the primitive counterpart of the command

<br/><br/>

## Points and Vectors


The library models 2D geometry explicitly:

- **`Point2D`**: an absolute position in 2D space
- **`Vector2D`**: a displacement with direction and magnitude

### 2D Point

#### Static Constants
`static readonly ORIGIN: Point2D` — the absolute origin point (0, 0).

#### Static Factory
`static of(x: number, y: number): Point2D` — creates a 2D point at given coordinates
```ts
const point: Point2D = Point2D.of(5, 2);
```

#### Properties

- `x: number` — X coordinate (read‑only)
- `y: number` — Y coordinate (read‑only)

#### Methods

`add(vector: Vector2D): Point2D` — translates the point by a 2D vector
```ts
const translatedPoint: Point2D = point.add(Vector2D.of(3, -3));
```
---
`toVector(): Vector2D` — converts the point to a vector from the origin
```ts
const vector: Vector2D = point.toVector();
```
<br/>

### 2D Vector

#### Static Constants
`static readonly NULL_VECTOR: Vector2D` — a zero‑length vector (0, 0).

#### Static Factories

`static of(x: number, y: number)` — creates a vector from coordinates
```ts
const vector: Vector2D = Vector2D.of(2, 3);
```
---
`static polar(radius: number, angle: number)` — creates a vector with polar coordinates—a radius and an angle. 
```ts
// vector at 45 degrees from the x-axis of length 2 units
const vectorAtAngle: Vector2D = Vector2D.polar(2, Math.PI / 4);
```
---
`static from(initial: Point2D, terminal: Point2D)` — creates a vector from one point to another
```ts
const a = Point2D.of(7, 7);
const b = Point2D.of(8, 8);
const vectorFromAToB = Vector2D.from(a, b);
// equivalent to Vector2D.of(1, 1)
```

#### Properties

- `x: number` — X component
- `y: number` — Y component
- `magnitude: number` — Length of the vector — `Math.hypot(x, y)`
- `slope: number` — `y / x` (⚠ undefined for `x = 0`)
- `angle: number` _ `Math.atan2(y, x)`

#### Non-mutating Methods

`add(vector: Vector2D): Vector2D` — performs vector addition
```ts
const vectorA: Vector2D = Vector2D.of(1, 2);
const vectorB: Vector2D = Vector2D.of(2, 1);
// (aX + bX, aY + bY) = (1 + 2, 2 + 1) = (3, 3);
const vectorC: Vector2D = vectorA.add(vectorB);
```
---
`subtract(vector: Vector2D): Vector2D` — performs vector subtraction
```ts
const vectorA: Vector2D = Vector2D.of(1, 2);
const vectorB: Vector2D = Vector2D.of(2, 1);
// (aX - bX, aY - bY) = (1 - 2, 2 - 1) = (-1, 1);
const vectorC: Vector2D = vectorA.subtract(vectorB);
```
---
`dotProduct(vector: Vector2D): number` — returns the dot product
```ts
const vectorA: Vector2D = Vector2D.of(1, 2);
const vectorB: Vector2D = Vector2D.of(2, 1);
const dotProduct: number = vectorA.dotProduct(vectorB);
```
---
`crossProduct(vector: Vector2D): number` — returns the scalar cross product
```ts
const vectorA: Vector2D = Vector2D.of(1, 2);
const vectorB: Vector2D = Vector2D.of(2, 1);
const crossProduct: number = vectorA.crossProduct(vectorB);
```
---
`normalize(): Vector2D` — returns the normalized vector (or `Vector2D.NULL_VECTOR` if magnitude is 0)
```ts
const vector: Vector2D = Vector2D.of(1, 2);
const unitVector: Vector2D = vector.normalize();
```
---
`perpendicular(orientation?: 1 | -1): Vector2D` — returns the perpendicular vector

`orientation` specifies the orientation of rotation for perpendicular vectors:
* `1 (default)`—specifying clockwise in SVG's coordinate system.
* `-1`—specifying counterclockwise in SVG's coordinate system.
```ts
const vector: Vector2D = Vector2D.of(1, 2);
// perpendicular vector, clockwise
const clockwisePerp: Vector2D = vector.perpendicular();
// perpendicular vector, counterclockwise
const counterClockwisePerp: Vector2D = vector.perpendicular(-1);
```
> Note: SVG uses a top-left origin with a downward-increasing y-axis, which inverts orientation semantics compared to the conventional mathematical Cartesian system.
In the conventional Cartesian system, a positive orientation would correspond to counterclockwise and a negative orientation would correspond to clockwise.
Perpendicular vectors can also be obtained using the `rotate` method with angles of `±Math.PI / 2`.
---
`opposite(): Vector2D` — returns the negated vector
```ts
const vector: Vector2D = Vector2D.of(5, 6);
// (-1 * x, -1 * y) = (-1 * 5, -1 * 6) = (-5, -6)
const oppositeVector: Vector2D = vector.opposite();
```
---
`clone(): Vector2D` — returns an identical copy
```ts
const vector: Vector2D = Vector2D.of(1, 2);
const vectorClone: Vector2D = vector.clone();
```
---
`toPoint(): Point2D` — converts the vector to a point relative to the origin
```ts
const vector: Vector2D = Vector2D.of(1, 2);
// equivalent to Point2D.of(1, 2);
const point: Point2D = vector.toPoint();
```

#### Mutating Methods

`scale(scalar: number): this` — scales the vector in place and updates magnitude
```ts
const vector: Vector2D = Vector2D.of(1, 2);
vector.scale(2); // mutated to (2, 4);
```
---
`rotate(angle: number): this` — rotates the vector by the given angle (radians) around the origin
```ts
const vector: Vector2D = Vector2D.of(1, 2);
// (x * cos(angle) - y * sin(angle), x * sin(angle) + y * cos(angle))
vector.rotate(Math.PI / 2); // mutated to (-4, 2)
```

<br/><br/>

## TypeScript Support

- All public classes and functions ship with `.d.ts` declarations.
- Works smoothly in TS projects; you get autocomplete for:
  - `Point2D`, `Vector2D`,
  - `PathBuilder` and the `Command` classes
  - `CubicBezierCurve` and the various arc / auto‑control helpers

<br/><br/>

## Summary of Public API

**Geometry**

- `Point2D.of(x, y)`
- `pointInstance.add(vector)`
- `Vector2D.of(x, y)`
- `Vector2D.polar(radius, angle)`
- `Vector2D.from(initial, terminal)`
- `vectorInstance.slope`
- `vectorInstance.angle`
- `vectorInstance.rotate(angle)`
- `vectorInstance.scale(scalar)`

**Path construction**

- `PathBuilder.m(vector)`
- Instance methods:
  - `m`, `l`, `q`, `c`, `a`
  - `bezierCircularArc`
  - `bezierEllipticalArc`
  - `cAutoControl`
  - `z`, `toPath`, `toString`

**Cubic Bézier utilities**

- `CubicBezierCurve`
  - `getPointAt(t)`
  - `getTangentAt(t)`
  - `splitAt(t, side?)`

This is the toolkit you use to build precise, smooth, and expressive SVG paths in a fully programmatic way.

<br/><br/>

## Note from Author

This library turned out to be really helpful for me when I was coding shapes. I think coding shapes gives us a degree of control over the mathematical details of the shape that we do not get in many of the graphic design software. I like to keep everything calculated and doing that in SVG is hard. Drawing a mere angled line can be quite challenging. Therefore, I think the point and vector utilities can prove to be useful anytime you're working with coordinates.

I'm aiming to expand this library and to expand the geometry. I want the consumers of this library, primarily myself, to be able to perform a wide range of geometric operations on the lines and curves and all kinds of shapes they're working on.

The package would also include an abstract `Curve` class with an `at(t: number): Point2D` method which you can extend to create an instance of any parametric curve. There are also spline functions that you can pass a curve to and they'll give you the tangent-matched spline for it. I'm currently working on it, I want to match the second derivatives and curvatures at the endpoints too so that I get a more accurate curve with less Bézier segments. I don't know if that's mathematically possible. I'm exploring. For this reason, I haven't exposed these classes and functions through the main index but you can find them in the package and use them if you like. The spline functions produce pretty good epitrochoids and hypotrochoids. I haven't tried many curves.

Suggestions are very welcome. Thanks a lot!