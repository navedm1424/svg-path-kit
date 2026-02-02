export function solveCubic(a: number, b: number, c: number, d: number): number[] {
    if (a === 0) throw new Error("Not a cubic equation");

    // Depress cubic: x = y - b/(3a)
    const p = (3 * a * c - b * b) / (3 * a * a);
    const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);

    const discriminant = (q * q) / 4 + (p * p * p) / 27;

    const roots: number[] = [];

    if (discriminant > 0) {
        // One real root
        const u = Math.cbrt(-q / 2 + Math.sqrt(discriminant));
        const v = Math.cbrt(-q / 2 - Math.sqrt(discriminant));
        roots.push(u + v - b / (3 * a));
    } else if (discriminant === 0) {
        // All roots real, at least two equal
        const u = Math.cbrt(-q / 2);
        roots.push(2 * u - b / (3 * a));
        roots.push(-u - b / (3 * a));
    } else {
        // Three real roots
        const r = Math.sqrt(-(p * p * p) / 27);
        const phi = Math.acos(-q / (2 * r));
        const t = 2 * Math.cbrt(r);
        roots.push(t * Math.cos(phi / 3) - b / (3 * a));
        roots.push(t * Math.cos((phi + 2 * Math.PI) / 3) - b / (3 * a));
        roots.push(t * Math.cos((phi + 4 * Math.PI) / 3) - b / (3 * a));
    }

    return roots;
}

export function solveQuartic(a: number, b: number, c: number, d: number, e: number): number[] {
    if (a === 0) throw new Error("Not a quartic equation");

    // Step 1: Depress quartic x = y - b/(4a)
    const p = (8 * a * c - 3 * b * b) / (8 * a * a);
    const q = (b * b * b - 4 * a * b * c + 8 * a * a * d) / (8 * a * a * a);
    const r = (-3 * b ** 4 + 256 * a ** 3 * e - 64 * a * a * b * d + 16 * a * b * b * c) / (256 * a ** 4);

    const roots: number[] = [];

    if (Math.abs(q) < 1e-12) {
        // Bi-quadratic case: y^4 + p*y^2 + r = 0
        const discrim = p * p - 4 * r;
        if (discrim >= 0) {
            const y1 = Math.sqrt((-p + Math.sqrt(discrim)) / 2);
            const y2 = Math.sqrt((-p - Math.sqrt(discrim)) / 2);
            [y1, -y1, y2, -y2].forEach(y => !isNaN(y) && roots.push(y - b / (4 * a)));
        }
    } else {
        // Solve the resolvent cubic: z^3 - (p/2) z^2 - r z + (r p/2 - q^2/8) = 0
        const cubicRoots = solveCubic(
            1,
            -p / 2,
            -r,
            (r * p) / 2 - (q * q) / 8
        );

        // Pick one real root
        const z = cubicRoots.find(x => !isNaN(x))!;
        const u = Math.sqrt(2 * z - p);
        const v = q / (2 * u);

        // Two quadratics: y^2 ± u*y + (z ± v) = 0
        [[1, 1], [1, -1]].forEach(([s1, s2]) => {
            const A = 1;
            const B = s1 * u;
            const C = z + s2 * v;
            const discrimQuad = B * B - 4 * A * C;
            if (discrimQuad >= 0) {
                roots.push((-B + Math.sqrt(discrimQuad)) / 2 - b / (4 * a));
                roots.push((-B - Math.sqrt(discrimQuad)) / 2 - b / (4 * a));
            }
        });
    }

    return roots;
}