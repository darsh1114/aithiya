import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readProjectFile(path: string): string {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

describe("independent deployment manifests", () => {
  it("defines Railway and Render backend commands around the standalone entrypoint", () => {
    const railway = JSON.parse(readProjectFile("railway.json")) as {
      build: { buildCommand: string };
      deploy: { startCommand: string; healthcheckPath: string };
    };
    const render = readProjectFile("render.yaml");

    expect(railway.build.buildCommand).toContain("pnpm build:backend");
    expect(railway.deploy.startCommand).toBe("pnpm start:backend");
    expect(railway.deploy.healthcheckPath).toBe("/health");
    expect(render).toContain("pnpm build:backend");
    expect(render).toContain("healthCheckPath: /health");
    expect(render).toContain("plan: free");
  });

  it("keeps server secrets out of the frontend image while forwarding its required public settings", () => {
    const frontendDockerfile = readProjectFile("docker/frontend.Dockerfile");
    const compose = readProjectFile("docker-compose.yml");

    expect(frontendDockerfile).toContain("ARG VITE_API_BASE_URL");
    expect(frontendDockerfile).toContain("ARG VITE_FRONTEND_FORGE_API_KEY");
    expect(frontendDockerfile).toContain("ARG VITE_OAUTH_PORTAL_URL");
    expect(frontendDockerfile).not.toContain("MONGODB_URI");
    expect(frontendDockerfile).not.toContain("JWT_SECRET");
    expect(compose).toContain("VITE_FRONTEND_FORGE_API_KEY");
    expect(compose).toContain("MONGODB_URI: ${MONGODB_URI}");
  });

  it("ships separate Docker definitions without overriding the managed root deployment image", () => {
    expect(existsSync(resolve(projectRoot, "docker/backend.Dockerfile"))).toBe(true);
    expect(existsSync(resolve(projectRoot, "docker/frontend.Dockerfile"))).toBe(true);
    expect(existsSync(resolve(projectRoot, "Dockerfile"))).toBe(false);
  });

  it("uses the current pnpm workspace configuration for patches and dependency overrides", () => {
    const workspaceConfig = readProjectFile("pnpm-workspace.yaml");
    const packageJson = JSON.parse(readProjectFile("package.json")) as { pnpm?: unknown };

    expect(workspaceConfig).toContain("patchedDependencies:");
    expect(workspaceConfig).toContain("overrides:");
    expect(packageJson.pnpm).toBeUndefined();
  });
});
