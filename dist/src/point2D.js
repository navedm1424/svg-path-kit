import { Vector2D } from "./vector2D";
export class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static of(x, y) {
        return new Point2D(x, y);
    }
    add(vector) {
        return new Point2D(this.x + vector.x, this.y + vector.y);
    }
    toVector() {
        return new Vector2D(this.x, this.y);
    }
}
