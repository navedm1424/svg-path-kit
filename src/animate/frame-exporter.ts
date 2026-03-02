import type {Frame, FramesData} from "./index.js";

export namespace FrameExporter {
    export async function exportToJson(data: Frame<any> | FramesData<any>, outputDirectoryPath: string, outputFileName: string): Promise<string> {
        const { writeJsonFile } = await import(
            typeof window !== "undefined" || typeof process === "undefined" || !process.versions?.node ?
                (() => {
                    throw new Error(`${exportToJson.name} can only run in Node.js.`);
                })():
                "./frame-exporter-internal.runtime.js"
            );
        return writeJsonFile(outputDirectoryPath, outputFileName, data);
    }
}