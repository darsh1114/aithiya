import { describe, expect, it } from "vitest";
import { curatedCulturePilot } from "../shared/culturePilot";
import type { TrpcContext } from "./_core/context";
import { listApprovedCultureRecords } from "./cultureRepository";
import { importCuratedCulturePilot, validateCuratedCulturePilot } from "./cultureImport";
import { appRouter } from "./routers";

function createNonOwnerAdminContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "non-owner-administrator",
      email: "admin@example.com",
      name: "Non-owner Administrator",
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

describe("curated cultural pilot import", () => {
  it("validates and idempotently imports the approved source-backed pilot into Atlas", async () => {
    expect(() => validateCuratedCulturePilot()).not.toThrow();
    expect(curatedCulturePilot).toHaveLength(22);

    const firstImport = await importCuratedCulturePilot();
    const secondImport = await importCuratedCulturePilot();
    const approvedRecords = await listApprovedCultureRecords();

    expect(firstImport.imported).toBe(22);
    expect(secondImport.imported).toBe(22);
    expect(approvedRecords).toHaveLength(22);
    expect(approvedRecords.map((record) => record.slug)).toEqual(expect.arrayContaining(firstImport.slugs));
    expect(approvedRecords.reduce<Record<string, number>>((counts, record) => {
      counts[record.category] = (counts[record.category] ?? 0) + 1;
      return counts;
    }, {})).toEqual({ festival: 9, tradition: 7, food: 3, story: 3 });
    expect(approvedRecords.every((record) =>
      record.source.url.startsWith("https://")
      && record.location.state.length > 0
      && record.location.region.length > 0
      && record.seasonMonths.length > 0,
    )).toBe(true);
  }, 30_000);

  it("blocks a non-owner administrator from importing the curated pilot", async () => {
    const caller = appRouter.createCaller(createNonOwnerAdminContext());
    await expect(caller.culture.importCuratedPilot()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
