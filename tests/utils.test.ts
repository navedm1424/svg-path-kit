import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { assignReadonlyProperties, makePropertiesReadonly } from "../src/utils/object-utils.runtime.js";
import { writeJsonFileInternal } from "../src/utils/file-utils-internal.runtime.js";
import { readFileSync, existsSync, rmSync } from "fs";
import { join } from "path";

describe("object-utils", () => {
  describe("assignReadonlyProperties", () => {
    it("assigns multiple properties as readonly", () => {
      const o: { a?: number; b?: string } = {};
      assignReadonlyProperties(o, { a: 1, get b() { return "x"; } });
      expect(o.a).toBe(1);
      expect(o.b).toBe("x");
      expect(() => { o.a = 2; }).toThrow();
      expect(() => Object.defineProperty(o, "a", { value: 2 })).toThrow();
      expect(() => Object.defineProperty(o, "b", { get() { return "y"; }})).toThrow();
    });
    it("makes properties non-configurable", () => {
      const o: { a?: number } = {};
      assignReadonlyProperties(o, { a: 1 });
      expect(() => delete o.a).toThrow();
    });
  });

  describe("makePropertiesReadonly", () => {
    it("makes existing properties readonly", () => {
      const o: { a: number; b: number } = { a: 1, b: 2 };
      makePropertiesReadonly(o, "a", "b");
      expect(o.a).toBe(1);
      expect(o.b).toBe(2);
      expect(() => { o.a = 99; }).toThrow();
      expect(() => Object.defineProperty(o, "a", { value: 99 })).toThrow();
    });
  });
});

describe("file-utils", () => {
  const testDir = join(process.cwd(), "test-output-file-utils");

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true });
  });

  describe("writeJsonFile", () => {
    it("throws on invalid output directory path", async () => {
      await expect(writeJsonFileInternal("", "file", {})).rejects.toThrow("Invalid output directory path");
      await expect(writeJsonFileInternal(null as any, "file", {})).rejects.toThrow();
    });
    it("throws on invalid output file name", async () => {
      await expect(writeJsonFileInternal(".", "", {})).rejects.toThrow("Invalid output file name");
      await expect(writeJsonFileInternal(".", null as any, {})).rejects.toThrow();
    });
    it("creates directory and writes JSON file", async () => {
      const filePath = await writeJsonFileInternal(testDir, "test", { foo: "bar", n: 1 });
      expect(filePath).toBe(join(testDir, "test.json"));
      expect(existsSync(filePath)).toBe(true);
      const content = readFileSync(filePath, "utf8");
      const data = JSON.parse(content);
      expect(data.foo).toBe("bar");
      expect(data.n).toBe(1);
    });
    it("creates nested directory when recursive", async () => {
      const nested = join(testDir, "a", "b");
      const filePath = await writeJsonFileInternal(nested, "nested", { x: 1 });
      expect(existsSync(filePath)).toBe(true);
      expect(JSON.parse(readFileSync(filePath, "utf8")).x).toBe(1);
    });
  });
});
