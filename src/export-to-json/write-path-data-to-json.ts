import fs from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { Path } from "../path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_FILE_NAME = "sample";

export async function writePathDataToJson(pathData: Path, outputDirectoryPath: string, outputFileName: string) {
    if (typeof process === "undefined" || !process.versions?.node) {
        throw new Error(`${writePathDataToJson.name} can only run in Node.js`);
    }
    if (!((pathData as any) instanceof Path))
        throw new Error("Invalid Path object.");
    if (typeof (outputFileName as any) !== "string")
        outputFileName = DEFAULT_FILE_NAME;

    const data = {
        pathData: pathData.toSVGPathString()
    };

    outputFileName = outputFileName.trim();
    const outputDirectory = path.resolve(__dirname, outputDirectoryPath);
    await mkdir(outputDirectory, { recursive: true });
    const filePath = path.resolve(outputDirectoryPath, `${outputFileName || DEFAULT_FILE_NAME}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    return filePath;
}

export async function writePathFramesToJson(durationInSeconds: number, paths: Path[], outputDirectoryPath: string, outputFileName: string) {
    if (typeof process === "undefined" || !process.versions?.node) {
        throw new Error(`${writePathFramesToJson.name} can only run in Node.js`);
    }
    if (typeof (outputFileName as any) !== "string")
        outputFileName = DEFAULT_FILE_NAME;

    const data = {
        durationMs: durationInSeconds * 1000,
        frames: paths.map(p => {
            if ((p as any) instanceof Path)
                return p.toSVGPathString();
            throw new Error("Invalid Path object.");
        })
    };

    outputFileName = outputFileName.trim();
    const outputDirectory = path.resolve(__dirname, outputDirectoryPath);
    await mkdir(outputDirectory, { recursive: true });
    const filePath = path.resolve(outputDirectory, `${outputFileName || DEFAULT_FILE_NAME}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    return filePath;
}