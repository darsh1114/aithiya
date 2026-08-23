import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("Vercel function source contract", () => {
  it("keeps the bundled catch-all handler in the repository-visible api directory", () => {
    const handlerPath = resolve(projectRoot, "api", "[...path].js");

    expect(existsSync(handlerPath)).toBe(true);
    expect(readFileSync(handlerPath, "utf8")).toContain("createApp");
  });

  it("does not ignore the JavaScript function that Vercel must discover", () => {
    const ignoreRules = readFileSync(resolve(projectRoot, ".gitignore"), "utf8");

    expect(ignoreRules).not.toMatch(/^api\/\*\.js$/m);
  });
});

