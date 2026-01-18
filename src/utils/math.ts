export function round(num: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}

export function clamp(
    value: number,
    min = 0,
    max = 1
) {
    if (min > max) {
        min = max;
        max = min;
    }

    return Math.max(min, Math.min(max, value));
}

export function ifNaN(num: number, fallback: number) {
    return num === num ? num : fallback;
}

export function ifNegative(num: number, mapper: (num: number) => number) {
    return num < 0 ? mapper(num) : num;
}

const TWO_PI = 2.0 * Math.PI;
const EPS = 1e-5;

export function continuousAngle(theta0: number, theta1: number): number {
    // unwrap theta1 to be closest to theta0
    let d = theta1 - theta0;
    d = (d + Math.PI) % TWO_PI;
    if (d < 0) d += TWO_PI;
    d -= Math.PI;

    theta1 = theta0 + d;

    // kill near-π numerical flips
    if (Math.abs(Math.abs(theta1 - theta0) - Math.PI) < EPS) {
        theta1 = theta0;
    }

    return theta1;
}

export function orderOfMagnitude(n: number): number {
    if (n === 0) return 0; // zero is a philosophical problem
    return Math.floor(Math.log10(Math.abs(n)));
}

// export function solveCubic(a: number, b: number, c: number): number {
//     // Depressed cubic: x^3 + px + q = 0
//     // Substitute: x = y - a/3 to remove quadratic term
//     const p = (3 * b - a * a) / 3;
//     const q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
//
//     const discriminant = (q * q) / 4 + (p * p * p) / 27;
//
//     if (discriminant < 0) {
//         // Three real roots, use trigonometric method
//         const phi = Math.acos(-q / (2 * Math.sqrt(-(p * p * p) / 27)));
//         // Choose one of the three roots
//         return 2 * Math.sqrt(-p / 3) * Math.cos(phi / 3 + (2 * Math.PI) / 3) - a / 3;
//     } else {
//         // One real root, use Cardano's formula
//         const sqrtDisc = Math.sqrt(discriminant);
//         return Math.cbrt(-q / 2 + sqrtDisc) + Math.cbrt(-q / 2 - sqrtDisc) - a / 3;
//     }
// }

// function solveCubic(a: number, b: number, c: number, d: number): number[] {
//     if (a === 0) throw new Error("Not a cubic equation");
//
//     // Depress cubic: x = y - b/(3a)
//     const p = (3 * a * c - b * b) / (3 * a * a);
//     const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
//
//     const discriminant = (q * q) / 4 + (p * p * p) / 27;
//
//     const roots: number[] = [];
//
//     if (discriminant > 0) {
//         // One real root
//         const u = Math.cbrt(-q / 2 + Math.sqrt(discriminant));
//         const v = Math.cbrt(-q / 2 - Math.sqrt(discriminant));
//         roots.push(u + v - b / (3 * a));
//     } else if (discriminant === 0) {
//         // All roots real, at least two equal
//         const u = Math.cbrt(-q / 2);
//         roots.push(2 * u - b / (3 * a));
//         roots.push(-u - b / (3 * a));
//     } else {
//         // Three real roots
//         const r = Math.sqrt(-(p * p * p) / 27);
//         const phi = Math.acos(-q / (2 * r));
//         const t = 2 * Math.cbrt(r);
//         roots.push(t * Math.cos(phi / 3) - b / (3 * a));
//         roots.push(t * Math.cos((phi + 2 * Math.PI) / 3) - b / (3 * a));
//         roots.push(t * Math.cos((phi + 4 * Math.PI) / 3) - b / (3 * a));
//     }
//
//     return roots;
// }


// export function solveQuartic(a: number, b: number, c: number, d: number, e: number): number[] {
//     if (a === 0) throw new Error("Not a quartic equation");
//
//     // Step 1: Depress quartic x = y - b/(4a)
//     const p = (8 * a * c - 3 * b * b) / (8 * a * a);
//     const q = (b * b * b - 4 * a * b * c + 8 * a * a * d) / (8 * a * a * a);
//     const r = (-3 * b ** 4 + 256 * a ** 3 * e - 64 * a * a * b * d + 16 * a * b * b * c) / (256 * a ** 4);
//
//     const roots: number[] = [];
//
//     if (Math.abs(q) < 1e-12) {
//         // Bi-quadratic case: y^4 + p*y^2 + r = 0
//         const discrim = p * p - 4 * r;
//         if (discrim >= 0) {
//             const y1 = Math.sqrt((-p + Math.sqrt(discrim)) / 2);
//             const y2 = Math.sqrt((-p - Math.sqrt(discrim)) / 2);
//             [y1, -y1, y2, -y2].forEach(y => !isNaN(y) && roots.push(y - b / (4 * a)));
//         }
//     } else {
//         // Solve the resolvent cubic: z^3 - (p/2) z^2 - r z + (r p/2 - q^2/8) = 0
//         const cubicRoots = solveCubic(
//             1,
//             -p / 2,
//             -r,
//             (r * p) / 2 - (q * q) / 8
//         );
//
//         // Pick one real root
//         const z = cubicRoots.find(x => !isNaN(x))!;
//         const u = Math.sqrt(2 * z - p);
//         const v = q / (2 * u);
//
//         // Two quadratics: y^2 ± u*y + (z ± v) = 0
//         [[1, 1], [1, -1]].forEach(([s1, s2]) => {
//             const A = 1;
//             const B = s1 * u;
//             const C = z + s2 * v;
//             const discrimQuad = B * B - 4 * A * C;
//             if (discrimQuad >= 0) {
//                 roots.push((-B + Math.sqrt(discrimQuad)) / 2 - b / (4 * a));
//                 roots.push((-B - Math.sqrt(discrimQuad)) / 2 - b / (4 * a));
//             }
//         });
//     }
//
//     return roots;
// }

// Example usage:
// console.log(solveQuartic(-0.016504605912727902, 0, 3.2559342937489393, -7.999999999999997, -62.07862908058256));
// Expected: roots of x^4 - 5x^2 + 4 = 0 => x = ±1, ±2