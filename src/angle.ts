export class Angle {
    readonly sine: number;
    readonly cosine: number;
    public static readonly UP = Angle.of(-Math.PI / 2);
    public static readonly DOWN = Angle.of(Math.PI / 2);
    public static readonly RIGHT = Angle.of(0);
    public static readonly LEFT = Angle.of(Math.PI);

    constructor(readonly value: number) {
        this.sine = Math.sin(value);
        this.cosine = Math.cos(value);
    }

    public static of(value: number) {
        return new Angle(value);
    }
}