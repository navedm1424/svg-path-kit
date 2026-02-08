import fs from "fs";
import {mkdir} from "fs/promises";
import path from "path";
import {Path} from "../path";
import {fileURLToPath} from "node:url";

const DEFAULT_FILE_NAME = "sample";

function getInvokerPath() {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error();
    const stack = err.stack as unknown as NodeJS.CallSite[];
    Error.prepareStackTrace = originalPrepareStackTrace;

    // stack[0] is this function, stack[1] is the caller
    const callerFile = stack[2]!.getFileName();
    return fileURLToPath(callerFile!);
}

export async function writePathDataToJson(pathData: Path, outputDirectoryPath: string, outputFileName: string) {
    if (typeof process === "undefined" || !process.versions?.node) {
        throw new Error(`${writePathDataToJson.name} can only run in Node.js`);
    }
    if (!((pathData as any) instanceof Path))
        throw new Error("Invalid Path object.");
    if (typeof (outputFileName as any) !== "string")
        outputFileName = DEFAULT_FILE_NAME;
    const __dirname = path.dirname(getInvokerPath());

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
    const __dirname = path.dirname(getInvokerPath());

    outputFileName = outputFileName.trim();
    const outputDirectory = path.resolve(__dirname, outputDirectoryPath);
    await mkdir(outputDirectory, { recursive: true });
    const filePath = path.resolve(outputDirectory, `${outputFileName || DEFAULT_FILE_NAME}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    return filePath;
}