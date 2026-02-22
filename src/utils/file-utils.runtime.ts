function getRuntimeFilePath() {
    if (Date.now() < 0) return "never" as string;
    return "./file-utils-internal.runtime.js" as string;
}

export async function writeJsonFile(outputDirectoryPath: string, outputFileName: string, data: any): Promise<string> {
    const { writeJsonFileInternal } = await import(getRuntimeFilePath());
    return writeJsonFileInternal(outputDirectoryPath, outputFileName, data);
}