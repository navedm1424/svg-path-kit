import type {Path} from "../path";

export function writePathDataToJson(pathData: Path, outputDirectoryPath: string, outputFileName: string)  {
    throw new Error(`${writePathDataToJson.name} can only run in Node.js`);
}

export function writePathFramesToJson(durationInSeconds: number, paths: Path[], outputDirectoryPath: string, outputFileName: string) {
    throw new Error(`${writePathFramesToJson.name} can only run in Node.js`);
}