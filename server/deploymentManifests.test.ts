import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("deployment manifests", () => {
  it("keeps Vercel static and Render focused on the public culture API", () => {
    const vercel = JSON.parse(readFileSync(resolve(projectRoot, "vercel.json"), "utf8")) as { buildCommand: string; outputDirectory: string };
    const render = readFileSync(resolve(projectRoot, "render.yaml"), "utf8");

    expect(vercel.buildCommand).toBe("pnpm build:client");
    expect(vercel.outputDirectory).toBe("dist/public");
    expect(render).toContain("name: aithiya-backend");
    expect(render).toContain("plan: free");
    expect(render).toContain("pnpm build:api");
    expect(render).toContain("pnpm start");
  });
});
