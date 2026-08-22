import { afterAll, describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { closeMongoClientForTests } from "./mongodb";
import { appRouter } from "./routers";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "mongo-connection-test-admin",
      email: "admin@example.com",
      name: "Mongo Connection Test Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("culture.connectionStatus", () => {
  afterAll(async () => {
    await closeMongoClientForTests();
  });

  it("uses MONGODB_URI to reach the configured Atlas database through the tRPC endpoint", async () => {
    expect(process.env.MONGODB_URI).toMatch(/^mongodb(\+srv)?:\/\//);

    const caller = appRouter.createCaller(createAdminContext());
    await expect(caller.culture.connectionStatus()).resolves.toEqual({
      connected: true,
      database: "india_culture_explorer",
    });
  }, 15_000);
});
