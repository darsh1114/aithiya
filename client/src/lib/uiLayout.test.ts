import { describe, expect, it } from "vitest";
import { discoveryContentClass, discoveryListClass } from "./uiLayout";

describe("discovery layout", () => {
  it("keeps the results list inside its own responsive scroll region", () => {
    expect(discoveryListClass).toContain("overflow-y-auto");
    expect(discoveryListClass).toContain("max-h-[52vh]");
    expect(discoveryListClass).toContain("xl:max-h-none");
    expect(discoveryContentClass).toContain("xl:h-[min(660px,calc(100vh-11rem))]");
  });
});
