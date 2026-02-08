import type {Path} from "../path";

export function writePathDataToJson(pathData: Path, outputFileName: string)  {
    throw new Error(`${writePathDataToJson.name} can only run in Node.js`);
}

export function writePathFramesToJson(duration: number, paths: Path[], outputFileName: string) {
    throw new Error(`${writePathFramesToJson.name} can only run in Node.js`);
}