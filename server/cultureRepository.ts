import type { Filter } from "mongodb";
import { ObjectId } from "mongodb";
import type { CultureRecord, CultureStatus } from "../shared/culture";
import { getCultureDb } from "./mongodb";

const CULTURE_COLLECTION = "cultureRecords";

type CultureRecordDocument = Omit<CultureRecord, "id"> & {
  _id: ObjectId;
  searchText: string;
};

export type CreateCultureRecord = Omit<CultureRecord, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: CultureStatus;
};

let indexesPromise: Promise<void> | null = null;

function toSearchText(record: Pick<CultureRecord, "title" | "summary" | "history" | "culturalImportance" | "location">): string {
  return [record.title, record.summary, record.history, record.culturalImportance, record.location.state, record.location.region]
    .join(" ")
    .toLowerCase();
}

function toCultureRecord(document: CultureRecordDocument): CultureRecord {
  const { _id, searchText: _searchText, ...record } = document;
  return { id: _id.toHexString(), ...record };
}

async function getCollection() {
  const db = await getCultureDb();
  const collection = db.collection<CultureRecordDocument>(CULTURE_COLLECTION);

  if (!indexesPromise) {
    indexesPromise = collection
      .createIndexes([
        { key: { slug: 1 }, name: "culture_slug_unique", unique: true },
        { key: { status: 1, category: 1, "location.region": 1, updatedAt: -1 }, name: "culture_public_filter" },
        { key: { "location.coordinates": "2dsphere" }, name: "culture_location_geo" },
        { key: { searchText: "text" }, name: "culture_search" },
      ])
      .then(() => undefined)
      .catch((error: unknown) => {
        indexesPromise = null;
        throw error;
      });
  }

  await indexesPromise;
  return collection;
}

export async function listApprovedCultureRecords(input?: {
  category?: CultureRecord["category"];
  region?: string;
  query?: string;
}): Promise<CultureRecord[]> {
  const collection = await getCollection();
  const filter: Filter<CultureRecordDocument> = { status: "approved" };

  if (input?.category) filter.category = input.category;
  if (input?.region) filter["location.region"] = input.region;
  if (input?.query) filter.$text = { $search: input.query.trim() };

  const records = await collection.find(filter).sort({ updatedAt: -1 }).toArray();
  return records.map(toCultureRecord);
}

export async function getApprovedCultureRecordBySlug(slug: string): Promise<CultureRecord | null> {
  const collection = await getCollection();
  const record = await collection.findOne({ slug, status: "approved" });
  return record ? toCultureRecord(record) : null;
}

/** Intended for future owner import and approved moderation workflows. No seed data is created automatically. */
export async function upsertCultureRecord(record: CreateCultureRecord): Promise<CultureRecord> {
  const [storedRecord] = await upsertCultureRecords([record]);
  if (!storedRecord) throw new Error("Culture record was not available after saving.");
  return storedRecord;
}

export async function upsertCultureRecords(records: CreateCultureRecord[]): Promise<CultureRecord[]> {
  if (!records.length) return [];

  const collection = await getCollection();
  const now = new Date();
  await collection.bulkWrite(
    records.map((record) => ({
      updateOne: {
        filter: { slug: record.slug },
        update: {
          $set: {
            ...record,
            status: record.status ?? "draft",
            searchText: toSearchText(record),
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    })),
    { ordered: true },
  );

  const storedRecords = await collection.find({ slug: { $in: records.map((record) => record.slug) } }).toArray();
  const recordsBySlug = new Map(storedRecords.map((record) => [record.slug, toCultureRecord(record)]));

  return records.map((record) => {
    const storedRecord = recordsBySlug.get(record.slug);
    if (!storedRecord) throw new Error(`Culture record was not available after saving: ${record.slug}`);
    return storedRecord;
  });
}
