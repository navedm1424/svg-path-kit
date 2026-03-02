import fs from "fs";
import {mkdir} from "fs/promises";
import path from "path";

export async function writeJsonFile(outputDirectoryPath: string, outputFileName: string, data: any) {
    if (!(typeof (outputDirectoryPath as any) === "string" && outputDirectoryPath))
        throw new Error("Invalid output directory path.");
    if (!(typeof (outputFileName as any) === "string" && outputFileName))
        throw new Error("Invalid output file name.");

    const cwd = process.cwd();
    outputDirectoryPath = outputDirectoryPath.trim();
    outputDirectoryPath = path.resolve(cwd, outputDirectoryPath);
    await mkdir(outputDirectoryPath, { recursive: true });
    outputFileName = outputFileName.trim();

    const filePath = path.resolve(outputDirectoryPath, `${outputFileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return filePath;
}