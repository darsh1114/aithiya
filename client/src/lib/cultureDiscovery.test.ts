import { describe, expect, it } from "vitest";
import { buildCultureListFilter, formatSeason, uniqueRegions } from "./cultureDiscovery";

describe("culture discovery helpers", () => {
  it("formats year-round and seasonal records for results cards", () => {
    expect(formatSeason([1, 2, 3])).toBe("January · February · March");
    expect(formatSeason([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe("Year-round");
  });

  it("returns a sorted, de-duplicated region filter list", () => {
    const records = [
      { location: { region: "South India" } },
      { location: { region: "East India" } },
      { location: { region: "South India" } },
    ] as never[];

    expect(uniqueRegions(records)).toEqual(["East India", "South India"]);
  });

  it("builds combined text, category, and region inputs for responsive discovery controls", () => {
    expect(buildCultureListFilter({ search: "  Pongal ", category: "festival", region: "South India" })).toEqual({
      category: "festival",
      region: "South India",
      query: "Pongal",
    });
    expect(buildCultureListFilter({ search: "   ", category: "all", region: "all" })).toEqual({});
  });
});
