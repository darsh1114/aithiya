import { cultureCategories, cultureStatuses, sourceConfidences, type CultureRecord } from "../shared/culture";
import { curatedCulturePilot, type CuratedCultureRecord } from "../shared/culturePilot";
import { upsertCultureRecords } from "./cultureRepository";

function assertCuratedRecord(record: CuratedCultureRecord): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
    throw new Error(`Invalid culture-record slug: ${record.slug}`);
  }
  if (!cultureCategories.includes(record.category) || !cultureStatuses.includes(record.status)) {
    throw new Error(`Invalid category or review status for ${record.slug}`);
  }
  if (!sourceConfidences.includes(record.source.confidence)) {
    throw new Error(`Invalid source confidence for ${record.slug}`);
  }
  const sourceUrl = new URL(record.source.url);
  if (sourceUrl.protocol !== "https:") throw new Error(`Source URL must use HTTPS for ${record.slug}`);
  const [longitude, latitude] = record.location.coordinates;
  if (Math.abs(longitude) > 180 || Math.abs(latitude) > 90) {
    throw new Error(`Invalid coordinates for ${record.slug}`);
  }
  if (!record.seasonMonths.length || record.seasonMonths.some((month) => month < 1 || month > 12)) {
    throw new Error(`Invalid season months for ${record.slug}`);
  }
  if (new Set(record.seasonMonths).size !== record.seasonMonths.length) {
    throw new Error(`Duplicate season month for ${record.slug}`);
  }
  if (![record.title, record.summary, record.history, record.culturalImportance, record.impact, record.bestVisitingTime].every((value) => value.trim().length > 0)) {
    throw new Error(`Incomplete public text for ${record.slug}`);
  }
}

// Validate before writing so incomplete records never become public data by accident.
export function validateCuratedCulturePilot(records = curatedCulturePilot): void {
  const slugs = new Set<string>();
  for (const record of records) {
    assertCuratedRecord(record);
    if (slugs.has(record.slug)) throw new Error(`Duplicate pilot slug: ${record.slug}`);
    slugs.add(record.slug);
  }
}

export async function importCuratedCulturePilot(): Promise<{ imported: number; slugs: string[] }> {
  validateCuratedCulturePilot();
  const imported: CultureRecord[] = await upsertCultureRecords(curatedCulturePilot);

  return { imported: imported.length, slugs: imported.map((record) => record.slug) };
}
