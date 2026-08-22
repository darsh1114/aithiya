import type { CultureCategory, CultureRecord } from "@shared/culture";

export const categoryPresentation: Record<CultureCategory, { label: string; shortLabel: string; tone: string }> = {
  festival: { label: "Festivals", shortLabel: "Festival", tone: "bg-amber-100 text-amber-800 ring-amber-200" },
  tradition: { label: "Traditions", shortLabel: "Tradition", tone: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  food: { label: "Foodways", shortLabel: "Food", tone: "bg-rose-100 text-rose-800 ring-rose-200" },
  story: { label: "Stories", shortLabel: "Story", tone: "bg-indigo-100 text-indigo-800 ring-indigo-200" },
};

export type CultureDiscoveryFilters = {
  search: string;
  category: CultureCategory | "all";
  region: string;
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatSeason(months: number[]): string {
  if (months.length === 12) return "Year-round";
  return months.map((month) => monthNames[month - 1]).filter(Boolean).join(" · ");
}

export function uniqueRegions(records: CultureRecord[]): string[] {
  return Array.from(new Set(records.map((record) => record.location.region))).sort((a, b) => a.localeCompare(b));
}

export function buildCultureListFilter({ search, category, region }: CultureDiscoveryFilters): { category?: CultureCategory; region?: string; query?: string } {
  const query = search.trim();
  return {
    ...(category !== "all" ? { category } : {}),
    ...(region !== "all" ? { region } : {}),
    ...(query ? { query } : {}),
  };
}
