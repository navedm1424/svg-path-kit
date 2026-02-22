export async function writeJsonFile(outputDirectoryPath: string, outputFileName: string, data: any): Promise<string> {
    const { writeJsonFileInternal } = await import(
        typeof window !== "undefined" || typeof process === "undefined" || !process.versions?.node ?
            (() => {
                throw new Error('This functionality is only available in Node.js');
            })():
            "./file-utils-internal.runtime.js"
    );
    return writeJsonFileInternal(outputDirectoryPath, outputFileName, data);
}