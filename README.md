## SVG Path Kit

SVG Path Kit is a geometry-oriented TypeScript library for building complex SVG path strings with mathematical precision.

![Epitrochoid](https://raw.githubusercontent.com/navedm1424/svg-path-kit/fec0dded89213bf9a69e90b5b249df36eb29b69f/assets/examples/epitrochoid.svg)
![Bulb](https://raw.githubusercontent.com/navedm1424/svg-path-kit/fec0dded89213bf9a69e90b5b249df36eb29b69f/assets/examples/bulb.svg)
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

## This library allows you to...

- Draw circular and elliptical arcs without having to deal with cubic Bézier control point coordinates or the confusing flags of the elliptical arc (`A`) command. You just have to specify the radii and angular parameters.
- Draw Hermite curves—curves that interpolate between velocities.
- Draw complex parametric curves like epitrochoids and hypotrochoids simply by extending the `ParametricCurve2D` class and providing the parametric equations.
- Draw vectors with polar coordinates, rotate and scale vectors, and obtain their angles and slopes using the `angle` and `slope` state accessors.
- Get the initial and terminal points of the last command or earlier commands in the sequence.
- Get the initial and terminal velocities of the last command or earlier commands in the sequence (using the `getStartVelocity` and `getEndVelocity`) to build continuous shapes and curves.

You can find the code samples in the GitHub repository inside the `samples` directory: the golf club icon, the bulb icon, and the epitrochoid.

<br/><br/>

## PathBuilder

`PathBuilder` is the main entry point for building complex SVG paths. It manages the current point, stacks of open subpaths, and provides high‑level methods for lines, curves, arcs, and auto‑controlled Béziers.

### API

---

#### Instantiation

- Relative start: `PathBuilder.m(vector: Vector2D)` – start a path with a relative move from `(0, 0)`.
- Absolute start: `PathBuilder.m(point: Point2D)` – start a path at an absolute point.

---

#### State accessors

- `lastCommand: Command` – last appended command.
- `currentPosition: Point2D` – absolute current endpoint (origin if no commands yet).
- `currentVelocity: Vector2D` – the velocity at the current point (ending velocity of the last command). 

---

#### Direct Wrappers

- `m` – move command.
- `l` – line command.
- `q` – quadratic Bézier command.
- `c` – cubic Bézier command.
- `a` – elliptical arc command.
- `z` – close-path command.

All these methods have at least two overloads: one with an absolute endpoint parameter (`Point2D`); another with a relative vector offset (`Vector2D`).

---

#### Geometric Utilities

- `circularArc`, `ellipticalArc` – these methods just take the radii and angular parameters and create a primitive elliptical arc (`A`) command by calculating the large-arc and sweep flags.
- `bezierCircularArc`, `bezierEllipticalArc` – these methods take the radii and angular parameters and give you the closest cubic Bézier approximations of circular and elliptical arcs.
- `hermiteCurve` – this method creates a cubic Bézier curve that interpolates between the endpoint velocities.
- `chordScaledBezier` – this method gives you a cubic Bézier curve with handle lengths scaled relative to the chord length and directed by angles.

---

#### Appending Commands

All of these methods have corresponding command classes that you can instantiate and append into the path builder.
- `append<T extends Command>(command: T): T`

---

#### Exporting and Serializing

After constructing your commands with `PathBuilder`:

- `toPath()` – create a `Path` instance with the appended commands.
- `toSVGPathString()` – serialize to an SVG `d` string.

<br/><br/>

## Note from Author

This library turned out to be really helpful for me when I was coding shapes. I think coding shapes gives us a degree of control over the mathematical details of a shape that we do not get in many of the graphic design software. I like to keep everything calculated and doing that in SVG is hard. Drawing a mere angled line with polar coordinates can be quite challenging. Therefore, I think the point and vector utilities can prove to be useful anytime you're working with coordinates, not just when working with SVG paths.

I'm aiming to expand this library and to expand the geometry. I want the consumers of this library, primarily myself, to be able to perform a wide range of geometric operations on the lines and curves and all kinds of shapes they're working on. If you have any ideas or suggestions or corrections, well, the library is open-source on GitHub.

Thanks a lot!