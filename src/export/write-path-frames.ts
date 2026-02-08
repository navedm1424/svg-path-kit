import fs from "fs";
import path from "path";
import { Path } from "../path";

export function writePathFrames(durationInSeconds: number, paths: Path[], outputFileName: string) {
    if (typeof process === "undefined" || !process.versions?.node) {
        throw new Error("This function can only run in Node.js");
    }

    const data = {
        durationMs: durationInSeconds * 1000,
        frames: paths.map(p => p.toSVGPathString())
    };

    const filePath = path.resolve(outputFileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    return filePath;
}
