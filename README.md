## SVG Path Kit

SVG Path Kit is a geometry-oriented TypeScript library for building complex SVG path strings with mathematical precision.

![Epitrochoid](https://raw.githubusercontent.com/navedm1424/svg-path-kit/fec0dded89213bf9a69e90b5b249df36eb29b69f/assets/examples/epitrochoid.svg)
![Bulb](https://raw.githubusercontent.com/navedm1424/svg-path-kit/24ca69418c210c7eadf8fbb8163e367021800f35/assets/examples/bulb.svg)
![Golf Club](https://raw.githubusercontent.com/navedm1424/svg-path-kit/ffecbb5c16116ceaa3828b5dcbdfb82d6be3caa2/assets/examples/golf_club.svg)

Instead of manually entering SVG path coordinates, you work with `Point2D`, `Vector2D`, spline fitters, and a `PathBuilder` that outputs a valid `d` attribute for `<path>` elements.

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

## Features

### Circular & Elliptical Arcs

Draw circular and elliptical arcs without having to deal with cubic Bézier control point coordinates or the confusing flags of the elliptical arc (`A`) command. You just have to specify:

- radius for circular arcs; semi-axes for elliptical arcs
- angular parameters (start angle and end angle)

```ts
const pb = PathBuilder.m(Point2D.ORIGIN);

// circular arc with the `A` command
// sweeping from 0 to π/2 radians
pb.circularArc(5, Angle.ZERO, Angle.HALF_PI);
// circular arc with the `C` command
// sweeping from π/2 to π radians
pb.bezierCircularArc(5, Angle.HALF_PI, Angle.PI);
```

---

### Hermite Curves

Draw Hermite curves—curves that interpolate between velocities.

```ts
const pb = PathBuilder.m(Point2D.ORIGIN);

pb.hermiteCurve(
    Vector2D.polar(2, Angle.HALF_PI), // start velocity
    Vector2D.polar(3, Angle.QUARTER_PI), // end velocity
    Vector2D.of(5, 6) // vector to endpoint
);
```

---

### Parametric Curve Splines

Draw complex parametric curves like epitrochoids and hypotrochoids simply by extending the `ParametricCurve2D` class and providing the parametric equations.

```ts
class Epitrochoid extends ParametricCurve2D {
    constructor(
        readonly statorRadius: number,
        readonly rotorRadius: number,
        readonly penDistance: number
    ) {
        super();
    }

    at(t: number): Point2D {
        const radiiSum = this.statorRadius + this.rotorRadius;
        const quotient = radiiSum / this.rotorRadius;
        return Point2D.of(
            radiiSum * Math.cos(t) - this.penDistance * Math.cos(t * quotient),
            radiiSum * Math.sin(t) - this.penDistance * Math.sin(t * quotient)
        );
    }

    // optionally write formula methods for the first and second derivatives at t
    tangentAt(t: number): Vector2D {
        // return velocity vector at t
    }
    accelerationAt(t: number): Vector2D {
        // return acceleration vector at t 
    }
}

const epitrochoid = new Epitrochoid(10, 6, 7);

const pb = PathBuilder.m(Point2D.ORIGIN);
fitSplineTo(pb, epitrochoid, 0, 12 * Math.PI);
```

---

### Vector Geometry

Draw vectors with polar coordinates, rotate and scale vectors, and obtain their angles and slopes using the `angle` and `slope` state accessors.

```ts
const vector = Vector2D.of(2, 3);
vector.slope // `y / x`
vector.angle // `atan2(y, x)`

// (5 * cos(π/6), 5 * sin(π/6)) 
const angledVector = Vector2D.polar(5, Math.PI / 6);

angledVector.rotate(Angle.QUARTER_PI);
// or `.rotate(Math.PI / 4)`

// doubles the length of the vector
angledVector.scale(2);
```

---

### Command Referencing

Reference the last command or earlier commands in the sequence and obtain their:

- initial and terminal points
- initial and terminal velocities
- along with other command-specific properties

```ts
const pb = PathBuilder.m(Point2D.ORIGIN);

const arcCommand = pb.circularArc(5, Angle.QUARTER_PI, Angle.PI);

// gives you the velocity at the endpoint of the arc
arcCommand.getEndVelocity();
```

You can also attach IDs to command using `setLastCommandId`:

```ts
pb.l(5, 0);
pb.setLastCommandId("shaft");

// ...other commands...

const shaftLineCommand = pb.getCommandById("shaft");
```

---

### Computing Path Animations

Compute and store path animations using the `FrameRenderer` utility:

```ts
import {PathBuilder, Point2D} from "svg-path-kit";
import {createFrameRenderer, Sequence, cubicBezierEasing} from "svg-path-kit/animate";

const sequence = Sequence.fromRatios(
    ["arc1", 1],
    ["arc2", 1]
).scaleToRange(0, 1);
const s = sequence.segments;

const renderer = createFrameRenderer((tl: Timeline, map: Interpolator) => {
    const pb = PathBuilder.m(Point2D.ORIGIN);

    const arc1Radius = map(s.arc1).to(1, 5);
    const arc1EndAngle = map(s.arc1).to(0, 3 * Math.PI / 4);
    pb.bezierCircularArc(arc1Radius, Angle.ZERO, arc1EndAngle);
    pb.l(pb.currentVelocity);

    const arc2Radius = map(s.arc2).to(1, 5);
    const arc2EndAngle = map(s.arc2).to(0, -Math.PI);
    const lineAngle = pb.currentVelocity.angle;
    pb.bezierCircularArc(arc2Radius, Angle.of(lineAngle).halfTurnBackward(), arc2EndAngle);

    return pb.toSVGPathString();
});

renderer.renderFrames({
    duration: 3,
    fps: 120,
    easing: cubicBezierEasing(0.55, 0.085, 0.68, 0.53)
}).exportToJson(
    // this path should be relative to `process.cwd()`
    "../json-exports",
    "path-data"
); // This will store the animation frames in a `path-data.json` file
```

> Note: `exportToJson` will only work in Node.js.

<br/><br/>

## Code Samples

You can find the code samples in the GitHub repository inside the `samples` directory: the golf club icon, the bulb icon, the epitrochoid, and more.

<br/><br/>

## PathBuilder API

`PathBuilder` is the main entry point for building complex SVG paths. It manages the current point, stacks of open subpaths, and provides high‑level methods for lines, curves, arcs, and auto‑controlled Béziers.

### Instantiation

- Relative start: `PathBuilder.m(vector: Vector2D)` – start a path with a relative move from `(0, 0)`.
- Absolute start: `PathBuilder.m(point: Point2D)` – start a path at an absolute point.

---

### State accessors

- `lastCommand: Command` – last appended command.
- `currentPosition: Point2D` – absolute current endpoint (origin if no commands yet).
- `currentVelocity: Vector2D` – the velocity at the current point (ending velocity of the last command). 

---

### Direct Wrappers

- `m` – move command.
- `l` – line command.
- `q` – quadratic Bézier command.
- `c` – cubic Bézier command.
- `a` – elliptical arc command.
- `z` – close-path command.

All these methods have at least two overloads: one with an absolute endpoint parameter (`Point2D`); another with a relative vector offset (`Vector2D`).

---

### Arc & Bézier Utilities

- `circularArc`, `ellipticalArc` – these methods just take the radii and angular parameters and create a primitive elliptical arc (`A`) command by calculating the large-arc and sweep flags.
- `bezierCircularArc`, `bezierEllipticalArc` – these methods take the radii and angular parameters and give you the closest cubic Bézier approximations of circular and elliptical arcs.
- `hermiteCurve` – this method creates a cubic Bézier curve that interpolates between the endpoint velocities.
- `handleDefinedBezier` – this method lets you specify the handle vectors (`start -> first control point` and `end -> second control points`) rather than the offset vectors of the control points.
- `chordScaledBezier` – this method gives you a cubic Bézier curve with handle lengths scaled relative to the chord length and directed by angles.

---

### Appending Commands

All of these methods have corresponding command classes that you can instantiate and append into the path builder.
- `append<T extends Command>(command: T): T`

---

### Exporting and Serializing

After constructing your commands with `PathBuilder`:

- `toPath()` – create a `Path` instance with the appended commands.
- `toSVGPathString()` – serialize to an SVG `d` string.
- `exportToJson()` – create a JSON file with the path data. *Can only run in Node.js*.

<br/><br/>

## Note from Author

This library turned out to be really helpful for me when I was coding shapes. I think coding shapes gives us a degree of control over the mathematical details of a shape that we do not get in many of the graphic design software. I like to keep everything calculated and doing that in SVG is hard. For any operation, you have to manipulate the raw coordinates. `svg-path-kit` gives you geometric utilities which encapsulate all that math and make SVG less painful and a bit more fun to work with.

I'm aiming to expand this library and to expand the geometry. I want this library to enable a wide range of geometric operations on all kinds of shapes, such as rotating, reflecting, dilating, finding intersections, and so on. If you have any ideas or suggestions or corrections, well, the library is open-source.

Thanks a lot!