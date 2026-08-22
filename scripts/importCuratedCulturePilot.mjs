import { importCuratedCulturePilot } from "../server/cultureImport.ts";
import { closeMongoClient } from "../server/mongodb.ts";

try {
  const result = await importCuratedCulturePilot();
  console.log(`Imported ${result.imported} curated cultural records.`);
} finally {
  await closeMongoClient();
}
