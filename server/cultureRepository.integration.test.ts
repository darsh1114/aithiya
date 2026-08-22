import { afterAll, describe, expect, it } from "vitest";
import { getCultureDb, closeMongoClient } from "./mongodb";
import { listApprovedCultureRecords } from "./cultureRepository";

describe("cultural-record storage", () => {
  afterAll(async () => {
    await closeMongoClient();
  });

  it("initializes the cultural-record indexes and reads approved records without inserting test data", async () => {
    const records = await listApprovedCultureRecords();
    expect(Array.isArray(records)).toBe(true);

    const db = await getCultureDb();
    const indexes = await db.collection("cultureRecords").indexes();
    const indexNames = indexes.map((index) => index.name);

    expect(indexNames).toEqual(
      expect.arrayContaining([
        "culture_slug_unique",
        "culture_public_filter",
        "culture_location_geo",
        "culture_search",
      ]),
    );
  }, 15_000);
});
