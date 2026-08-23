var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/mongodb.ts
var mongodb_exports = {};
__export(mongodb_exports, {
  closeMongoClient: () => closeMongoClient,
  getCultureDatabaseName: () => getCultureDatabaseName,
  getCultureDb: () => getCultureDb,
  getMongoClient: () => getMongoClient,
  pingCultureDatabase: () => pingCultureDatabase
});
import { MongoClient, ServerApiVersion } from "mongodb";
function getMongoUri() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MongoDB is not configured. Add MONGODB_URI in the project secrets.");
  }
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI must use a mongodb:// or mongodb+srv:// connection string.");
  }
  return uri;
}
function getCultureDatabaseName() {
  return process.env.MONGODB_DB_NAME?.trim() || DEFAULT_DATABASE_NAME;
}
async function getMongoClient() {
  if (client) return client;
  if (!clientPromise) {
    const nextClient = new MongoClient(getMongoUri(), {
      connectTimeoutMS: 1e4,
      serverSelectionTimeoutMS: 1e4,
      serverApi: {
        version: ServerApiVersion.v1,
        // Atlas text indexes are not available in strict Stable API mode.
        strict: false,
        deprecationErrors: true
      }
    });
    clientPromise = nextClient.connect().then((connectedClient) => {
      client = connectedClient;
      return connectedClient;
    }).catch(async (error) => {
      clientPromise = null;
      await nextClient.close().catch(() => void 0);
      throw new Error("Unable to connect to MongoDB Atlas.", { cause: error });
    });
  }
  return clientPromise;
}
async function getCultureDb() {
  const connectedClient = await getMongoClient();
  return connectedClient.db(getCultureDatabaseName());
}
async function pingCultureDatabase() {
  const db = await getCultureDb();
  await db.command({ ping: 1 });
  return { database: getCultureDatabaseName() };
}
async function closeMongoClient() {
  const activeClient = client;
  client = null;
  clientPromise = null;
  if (activeClient) {
    await activeClient.close();
  }
}
var DEFAULT_DATABASE_NAME, client, clientPromise;
var init_mongodb = __esm({
  "server/mongodb.ts"() {
    "use strict";
    DEFAULT_DATABASE_NAME = "india_culture_explorer";
    client = null;
    clientPromise = null;
  }
});

// server/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

// shared/culture.ts
var cultureCategories = ["festival", "tradition", "food", "story"];
var cultureStatuses = ["draft", "pending_review", "approved", "changes_requested", "rejected", "archived"];
var sourceConfidences = ["primary", "official", "secondary", "community"];

// shared/culturePilot.ts
var yearRound = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var nationalLocation = {
  state: "India",
  region: "National",
  coordinates: [78.9629, 20.5937]
};
var unesco = (title, url) => ({
  title,
  publisher: "UNESCO Intangible Cultural Heritage",
  url,
  confidence: "official"
});
var ministryOfTourism = (title, url) => ({
  title,
  publisher: "Ministry of Tourism, Government of India",
  url,
  confidence: "official"
});
var curatedCulturePilot = [
  {
    slug: "deepavali",
    title: "Deepavali",
    category: "festival",
    summary: "A widely observed Indian festival of lights, recognized on UNESCO's Representative List in 2025.",
    history: "UNESCO's India register records Deepavali as an inscribed element on the Representative List of the Intangible Cultural Heritage of Humanity.",
    culturalImportance: "The festival brings households and communities together through light, ritual, visiting, and shared observance.",
    impact: "Its annual return connects a living religious and social practice across many regions and diasporic communities.",
    location: nationalLocation,
    seasonMonths: [10, 11],
    bestVisitingTime: "October\u2013November; dates vary with the lunisolar calendar.",
    source: unesco("Deepavali", "https://ich.unesco.org/en/RL/deepavali-02312"),
    status: "approved"
  },
  {
    slug: "nawrouz-in-india",
    title: "Nawrouz in India",
    category: "festival",
    summary: "The spring new-year observance is represented in UNESCO's 2024 multinational Nawrouz inscription.",
    history: "UNESCO's India register includes India in the multi-country Nawrouz element inscribed in 2024.",
    culturalImportance: "The observance marks renewal and sustains cultural links among communities that celebrate the new year in spring.",
    impact: "It provides a cross-cultural lens on shared seasonal traditions that extend beyond one locality.",
    location: nationalLocation,
    seasonMonths: [3],
    bestVisitingTime: "March; confirm local community dates before travel.",
    source: unesco("Nawrouz", "https://ich.unesco.org/en/RL/nawrouz-novruz-nowrouz-nowrouz-nawrouz-nauryz-nooruz-nowruz-navruz-nevruz-nowruz-navruz-02097"),
    status: "approved"
  },
  {
    slug: "garba-of-gujarat",
    title: "Garba of Gujarat",
    category: "festival",
    summary: "A Gujarati dance tradition associated with the Navratri season and inscribed on UNESCO's Representative List.",
    history: "UNESCO's India register identifies Garba as an element of Gujarat on the Representative List.",
    culturalImportance: "Circular dance, music, and collective participation make Garba a visible expression of seasonal community celebration.",
    impact: "The practice sustains intergenerational performance knowledge and public cultural participation.",
    location: { state: "Gujarat", region: "West India", coordinates: [72.5714, 23.0225] },
    seasonMonths: [9, 10],
    bestVisitingTime: "September\u2013October during Navratri; dates vary annually.",
    source: unesco("Garba of Gujarat", "https://ich.unesco.org/en/RL/garba-of-gujarat-01962"),
    status: "approved"
  },
  {
    slug: "durga-puja-in-kolkata",
    title: "Durga Puja in Kolkata",
    category: "festival",
    summary: "A ten-day autumn festival in Kolkata combining worship, clay-image making, drumming, art, and public installations.",
    history: "UNESCO describes the festival as an annual September or October observance, inscribed in 2021.",
    culturalImportance: "It brings artisans, designers, worshippers, and visitors into a shared urban cultural season.",
    impact: "The festival supports collaborative creative practice alongside longstanding ritual observance.",
    location: { state: "West Bengal", region: "East India", coordinates: [88.3639, 22.5726] },
    seasonMonths: [9, 10],
    bestVisitingTime: "September\u2013October; dates vary with the festival calendar.",
    source: unesco("Durga Puja in Kolkata", "https://ich.unesco.org/en/RL/durga-puja-in-kolkata-00703"),
    status: "approved"
  },
  {
    slug: "kumbh-mela",
    title: "Kumbh Mela",
    category: "festival",
    summary: "A rotating sacred-river pilgrimage held at Prayagraj, Haridwar, Ujjain, and Nashik.",
    history: "UNESCO inscribed Kumbh Mela in 2017 and describes the event's combination of astronomy, ritual, social practice, and knowledge transmission.",
    culturalImportance: "The gathering connects ascetics, religious organizations, pilgrims, and visitors through shared river-bathing and observance.",
    impact: "Its rotating host cities demonstrate how one tradition takes different local forms across India.",
    location: { state: "Uttar Pradesh", region: "North India", coordinates: [81.8463, 25.4358] },
    seasonMonths: [1, 2, 3, 4],
    bestVisitingTime: "Dates and host city rotate; consult the current official Kumbh schedule.",
    source: unesco("Kumbh Mela", "https://ich.unesco.org/en/RL/kumbh-mela-01258"),
    status: "approved"
  },
  {
    slug: "hornbill-festival",
    title: "Hornbill Festival",
    category: "festival",
    summary: "A ten-day Nagaland cultural showcase bringing together performances, crafts, indigenous games, and cuisine.",
    history: "The Ministry of Tourism records the event as a State Government initiative conceptualized in 2000.",
    culturalImportance: "It creates a shared setting for Naga communities to present cultural diversity, craftsmanship, and performance.",
    impact: "The festival supports cultural visibility and creates a public platform for heritage-based tourism.",
    location: { state: "Nagaland", region: "Northeast India", coordinates: [94.1406, 25.6408] },
    seasonMonths: [12],
    bestVisitingTime: "Early December; confirm current annual dates with Nagaland Tourism.",
    source: ministryOfTourism("Hornbill Festival", "https://utsav.gov.in/public/view-event/hornbill-festival"),
    status: "approved"
  },
  {
    slug: "pongal-festival",
    title: "Pongal",
    category: "festival",
    summary: "A four-day Tamil harvest observance that honours nature, rain, the Sun, cattle, and communal food.",
    history: "The Ministry of Tourism's Utsav record describes the festival's four successive days of observance in January.",
    culturalImportance: "The celebration foregrounds gratitude for agriculture, animals, and seasonal abundance.",
    impact: "Ritual, food, and family gatherings keep a regional harvest tradition visible in public life.",
    location: { state: "Tamil Nadu", region: "South India", coordinates: [80.2707, 13.0827] },
    seasonMonths: [1],
    bestVisitingTime: "Mid-January; confirm the annual Tamil calendar dates.",
    source: ministryOfTourism("Harvest Festival", "https://utsav.gov.in/public/event-category/harvest-festival"),
    status: "approved"
  },
  {
    slug: "makar-sankranti",
    title: "Makar Sankranti",
    category: "festival",
    summary: "A mid-January solar festival marking the Sun's movement into Capricorn and the Uttarayan period.",
    history: "The Ministry of Tourism's harvest-festival page identifies Makar Sankranti with the transition out of shorter winter days.",
    culturalImportance: "The festival expresses seasonal change through kites, food, prayer, and regional celebrations.",
    impact: "Its varied regional forms show how a shared astronomical marker is interpreted across India.",
    location: nationalLocation,
    seasonMonths: [1],
    bestVisitingTime: "Mid-January.",
    source: ministryOfTourism("Harvest Festival", "https://utsav.gov.in/public/event-category/harvest-festival"),
    status: "approved"
  },
  {
    slug: "lohri",
    title: "Lohri",
    category: "festival",
    summary: "A North Indian winter festival associated with bonfires, seasonal foods, and community gathering.",
    history: "The Ministry of Tourism's harvest-festival page records its observance on 13 January and notes its roots in Punjab.",
    culturalImportance: "Bonfire rituals and shared foods create a communal marker of the winter season.",
    impact: "The festival continues to connect seasonal customs, family life, and local identity.",
    location: { state: "Punjab", region: "North India", coordinates: [75.8573, 30.9009] },
    seasonMonths: [1],
    bestVisitingTime: "13 January.",
    source: ministryOfTourism("Harvest Festival", "https://utsav.gov.in/public/event-category/harvest-festival"),
    status: "approved"
  },
  {
    slug: "yoga",
    title: "Yoga",
    category: "tradition",
    summary: "An Indian practice integrating poses, meditation, controlled breathing, chanting, and related techniques.",
    history: "UNESCO inscribed Yoga in 2016 and describes its traditional Guru-Shishya transmission alongside contemporary learning settings.",
    culturalImportance: "Yoga connects physical practice with philosophical, spiritual, educational, and community traditions.",
    impact: "Its practice and teaching remain part of cultural life in India while reaching learners internationally.",
    location: nationalLocation,
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round; programmes vary by location.",
    source: unesco("Yoga", "https://ich.unesco.org/en/RL/yoga-01163"),
    status: "approved"
  },
  {
    slug: "thatheras-utensil-craft",
    title: "Thatheras\u2019 Brass and Copper Utensil Craft",
    category: "tradition",
    summary: "A traditional metal-utensil making practice associated with Jandiala Guru in Punjab.",
    history: "UNESCO's India register identifies the craft among the Thatheras of Jandiala Guru, Punjab.",
    culturalImportance: "The practice preserves specialized knowledge of shaping and finishing metal household vessels.",
    impact: "Recognizing the craft supports attention to artisanal transmission and living material culture.",
    location: { state: "Punjab", region: "North India", coordinates: [74.7518, 31.5628] },
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round; arrange artisan visits respectfully in advance.",
    source: unesco("Traditional brass and copper craft of utensil making among the Thatheras of Jandiala Guru, Punjab, India", "https://ich.unesco.org/en/RL/traditional-brass-and-copper-craft-of-utensil-making-among-the-thatheras-of-jandiala-guru-punjab-india-00845"),
    status: "approved"
  },
  {
    slug: "sankirtana-manipur",
    title: "Sankirtana of Manipur",
    category: "tradition",
    summary: "A Manipur practice of ritual singing, drumming, and dancing.",
    history: "UNESCO's India register identifies Sankirtana as an inscribed ritual performance tradition of Manipur.",
    culturalImportance: "Music, movement, and ritual combine in a practice passed through performance and community participation.",
    impact: "Its safeguarding keeps an integrated musical and ceremonial tradition active in Manipur.",
    location: { state: "Manipur", region: "Northeast India", coordinates: [93.9368, 24.817] },
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round; performance calendars are locally determined.",
    source: unesco("Sankirtana, ritual singing, drumming and dancing of Manipur", "https://ich.unesco.org/en/RL/sankirtana-ritual-singing-drumming-and-dancing-of-manipur-00843"),
    status: "approved"
  },
  {
    slug: "chhau-dance",
    title: "Chhau Dance",
    category: "tradition",
    summary: "An eastern Indian dance tradition recognized by UNESCO.",
    history: "UNESCO's India register lists Chhau dance among India's Representative List elements.",
    culturalImportance: "The tradition brings stylized movement, music, and local performance lineages into public cultural life.",
    impact: "It provides a shared heritage lens across eastern Indian communities associated with Chhau practice.",
    location: { state: "West Bengal", region: "East India", coordinates: [86.3652, 23.3321] },
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round; local performance schedules vary.",
    source: unesco("Chhau dance", "https://ich.unesco.org/en/RL/chhau-dance-00337"),
    status: "approved"
  },
  {
    slug: "kalbelia-folk-songs-and-dances",
    title: "Kalbelia Folk Songs and Dances",
    category: "tradition",
    summary: "A Rajasthan performance tradition of folk song and dance recognized on UNESCO's Representative List.",
    history: "UNESCO's India register lists Kalbelia folk songs and dances of Rajasthan as an inscribed element.",
    culturalImportance: "The tradition makes music, movement, costume, and community memory visible through performance.",
    impact: "It supports recognition of a living Rajasthan performance heritage.",
    location: { state: "Rajasthan", region: "West India", coordinates: [75.7873, 26.9124] },
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round; consult local cultural calendars.",
    source: unesco("Kalbelia folk songs and dances of Rajasthan", "https://ich.unesco.org/en/RL/kalbelia-folk-songs-and-dances-of-rajasthan-00340"),
    status: "approved"
  },
  {
    slug: "mudiyettu",
    title: "Mudiyettu",
    category: "tradition",
    summary: "A Kerala ritual theatre and dance-drama tradition recognized by UNESCO.",
    history: "UNESCO's India register identifies Mudiyettu as a ritual theatre and dance drama of Kerala.",
    culturalImportance: "It holds ritual, narrative, music, and embodied performance together in a community practice.",
    impact: "Its listing draws attention to local artistic transmission and ceremonial performance.",
    location: { state: "Kerala", region: "South India", coordinates: [76.2673, 9.9312] },
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round; temple and community schedules vary.",
    source: unesco("Mudiyettu, ritual theatre and dance drama of Kerala", "https://ich.unesco.org/en/RL/mudiyettu-ritual-theatre-and-dance-drama-of-kerala-00345"),
    status: "approved"
  },
  {
    slug: "kutiyattam",
    title: "Kutiyattam, Sanskrit Theatre",
    category: "tradition",
    summary: "A Kerala Sanskrit theatre tradition recognized on UNESCO's Representative List.",
    history: "UNESCO's India register lists Kutiyattam as an inscribed Sanskrit theatre element.",
    culturalImportance: "The form preserves a long-form theatrical practice rooted in language, gesture, music, and performance training.",
    impact: "It sustains a distinct theatre lineage and makes its specialized artistic vocabulary visible to new audiences.",
    location: { state: "Kerala", region: "South India", coordinates: [76.2673, 9.9312] },
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round; check venue-specific programmes.",
    source: unesco("Kutiyattam, Sanskrit theatre", "https://ich.unesco.org/en/RL/kutiyattam-sanskrit-theatre-00010"),
    status: "approved"
  },
  {
    slug: "appam",
    title: "Appam",
    category: "food",
    summary: "A fermented rice-batter and coconut-milk preparation commonly served for breakfast or dinner in Kerala.",
    history: "Incredible India's Kochi food guide documents appam as a regional preparation made from fermented rice batter and coconut milk.",
    culturalImportance: "The dish reflects a widely recognized Kerala food practice centered on everyday ingredients and meal sharing.",
    impact: "Documenting the dish alongside festivals and arts broadens cultural discovery to everyday culinary knowledge.",
    location: { state: "Kerala", region: "South India", coordinates: [76.2673, 9.9312] },
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round.",
    source: ministryOfTourism("Food and Cuisine | Incredible India", "https://prod.incredibleindia.gov.in/content/incredible-india-v2/en/destinations/kochi/food-and-cuisine.html"),
    status: "approved"
  },
  {
    slug: "thalassery-biriyani",
    title: "Thalassery Biriyani",
    category: "food",
    summary: "A Malabar-coast biriyani associated with fragrant basmati rice, meat, spices, fried onions, cashews, and raisins.",
    history: "Incredible India's Kerala food guide identifies Thalassery Biriyani as a distinctive Malabar-coast dish.",
    culturalImportance: "It represents a regional culinary expression within the many biriyani traditions enjoyed across India.",
    impact: "Including a place-linked food record helps visitors connect cuisine with regional cultural geography.",
    location: { state: "Kerala", region: "South India", coordinates: [75.4836, 11.748] },
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round.",
    source: ministryOfTourism("What to Eat and Where to Eat in Thiruvananthapuram", "https://www.incredibleindia.gov.in/en/kerala/thiruvananthapuram/what-to-eat-and-where-to-eat-in-thiruvananthapuram"),
    status: "approved"
  },
  {
    slug: "pongal-sweet",
    title: "Pongal Sweet",
    category: "food",
    summary: "A sweet offering prepared during the Pongal harvest observance and offered to the Sun on its auspicious second day.",
    history: "The Ministry of Tourism's harvest-festival record describes the making of Pongal sweet during the four-day January observance.",
    culturalImportance: "The preparation ties seasonal food to ritual gratitude and the agricultural cycle.",
    impact: "Its inclusion highlights how food can be both an everyday practice and a ceremonial cultural expression.",
    location: { state: "Tamil Nadu", region: "South India", coordinates: [80.2707, 13.0827] },
    seasonMonths: [1],
    bestVisitingTime: "Mid-January during Pongal.",
    source: ministryOfTourism("Harvest Festival", "https://utsav.gov.in/public/event-category/harvest-festival"),
    status: "approved"
  },
  {
    slug: "ramlila",
    title: "Ramlila",
    category: "story",
    summary: "A traditional performance of the Ramayana recognized on UNESCO's Representative List.",
    history: "UNESCO's India register lists Ramlila as an inscribed traditional performance of the Ramayana.",
    culturalImportance: "The performance transmits a major narrative tradition through community staging, dialogue, music, and ritual context.",
    impact: "Its continuing practice keeps oral, theatrical, and narrative heritage accessible in public settings.",
    location: nationalLocation,
    seasonMonths: [9, 10],
    bestVisitingTime: "September\u2013October; dates and local performance cycles vary.",
    source: unesco("Ramlila, the traditional performance of the Ramayana", "https://ich.unesco.org/en/RL/ramlila-the-traditional-performance-of-the-ramayana-00110"),
    status: "approved"
  },
  {
    slug: "vedic-chanting",
    title: "Tradition of Vedic Chanting",
    category: "story",
    summary: "An oral tradition recognized by UNESCO's Representative List.",
    history: "UNESCO's India register lists the Tradition of Vedic chanting as an inscribed element.",
    culturalImportance: "The practice preserves oral transmission through sound, recitation, and teacher-student learning.",
    impact: "It draws attention to the cultural importance of oral knowledge systems and careful transmission.",
    location: nationalLocation,
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round; access depends on local institutions and observances.",
    source: unesco("Tradition of Vedic chanting", "https://ich.unesco.org/en/RL/tradition-of-vedic-chanting-00062"),
    status: "approved"
  },
  {
    slug: "buddhist-chanting-ladakh",
    title: "Buddhist Chanting of Ladakh",
    category: "story",
    summary: "The recitation of sacred Buddhist texts in Ladakh's trans-Himalayan region.",
    history: "UNESCO's India register lists Buddhist chanting of Ladakh as an inscribed element focused on recitation of sacred texts.",
    culturalImportance: "The practice carries religious philosophy and teaching through living oral performance.",
    impact: "It recognizes the role of monastic and community transmission in preserving a regional oral tradition.",
    location: { state: "Ladakh", region: "North India", coordinates: [77.577, 34.1526] },
    seasonMonths: yearRound,
    bestVisitingTime: "Year-round; access and local observance vary by monastery and season.",
    source: unesco("Buddhist chanting of Ladakh", "https://ich.unesco.org/en/RL/buddhist-chanting-of-ladakh-recitation-of-sacred-buddhist-texts-in-the-trans-himalayan-ladakh-region-jammu-and-kashmir-india-00839"),
    status: "approved"
  }
];

// server/cultureRepository.ts
init_mongodb();
var CULTURE_COLLECTION = "cultureRecords";
var indexesPromise = null;
function toSearchText(record) {
  return [record.title, record.summary, record.history, record.culturalImportance, record.location.state, record.location.region].join(" ").toLowerCase();
}
function toCultureRecord(document) {
  const { _id, searchText: _searchText, ...record } = document;
  return { id: _id.toHexString(), ...record };
}
async function getCollection() {
  const db = await getCultureDb();
  const collection = db.collection(CULTURE_COLLECTION);
  if (!indexesPromise) {
    indexesPromise = collection.createIndexes([
      { key: { slug: 1 }, name: "culture_slug_unique", unique: true },
      { key: { status: 1, category: 1, "location.region": 1, updatedAt: -1 }, name: "culture_public_filter" },
      { key: { "location.coordinates": "2dsphere" }, name: "culture_location_geo" },
      { key: { searchText: "text" }, name: "culture_search" }
    ]).then(() => void 0).catch((error) => {
      indexesPromise = null;
      throw error;
    });
  }
  await indexesPromise;
  return collection;
}
async function listApprovedCultureRecords(input) {
  const collection = await getCollection();
  const filter = { status: "approved" };
  if (input?.category) filter.category = input.category;
  if (input?.region) filter["location.region"] = input.region;
  if (input?.query) filter.$text = { $search: input.query.trim() };
  const records = await collection.find(filter).sort({ updatedAt: -1 }).toArray();
  return records.map(toCultureRecord);
}
async function getApprovedCultureRecordBySlug(slug) {
  const collection = await getCollection();
  const record = await collection.findOne({ slug, status: "approved" });
  return record ? toCultureRecord(record) : null;
}
async function upsertCultureRecords(records) {
  if (!records.length) return [];
  const collection = await getCollection();
  const now = /* @__PURE__ */ new Date();
  await collection.bulkWrite(
    records.map((record) => ({
      updateOne: {
        filter: { slug: record.slug },
        update: {
          $set: {
            ...record,
            status: record.status ?? "draft",
            searchText: toSearchText(record),
            updatedAt: now
          },
          $setOnInsert: { createdAt: now }
        },
        upsert: true
      }
    })),
    { ordered: true }
  );
  const storedRecords = await collection.find({ slug: { $in: records.map((record) => record.slug) } }).toArray();
  const recordsBySlug = new Map(storedRecords.map((record) => [record.slug, toCultureRecord(record)]));
  return records.map((record) => {
    const storedRecord = recordsBySlug.get(record.slug);
    if (!storedRecord) throw new Error(`Culture record was not available after saving: ${record.slug}`);
    return storedRecord;
  });
}

// server/cultureImport.ts
function assertCuratedRecord(record) {
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
function validateCuratedCulturePilot(records = curatedCulturePilot) {
  const slugs = /* @__PURE__ */ new Set();
  for (const record of records) {
    assertCuratedRecord(record);
    if (slugs.has(record.slug)) throw new Error(`Duplicate pilot slug: ${record.slug}`);
    slugs.add(record.slug);
  }
}
async function importCuratedCulturePilot() {
  validateCuratedCulturePilot();
  const imported = await upsertCultureRecords(curatedCulturePilot);
  return { imported: imported.length, slugs: imported.map((record) => record.slug) };
}

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Administrator access is required." });
  }
  return next({ ctx });
});
var ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ENV.ownerOpenId || ctx.user.openId !== ENV.ownerOpenId) {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Owner access is required." });
  }
  return next({ ctx });
});
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // Public discovery routes read only approved records. Admin and owner routes are protected.
  culture: router({
    list: publicProcedure.input(
      z2.object({
        category: z2.enum(cultureCategories).optional(),
        region: z2.string().trim().min(1).max(80).optional(),
        query: z2.string().trim().min(1).max(120).optional()
      }).optional()
    ).query(({ input }) => listApprovedCultureRecords(input)),
    bySlug: publicProcedure.input(z2.object({ slug: z2.string().trim().min(1).max(160) })).query(async ({ input }) => {
      const record = await getApprovedCultureRecordBySlug(input.slug);
      if (!record) throw new TRPCError3({ code: "NOT_FOUND", message: "Culture record not found." });
      return record;
    }),
    connectionStatus: adminProcedure2.query(async () => {
      const { pingCultureDatabase: pingCultureDatabase2 } = await Promise.resolve().then(() => (init_mongodb(), mongodb_exports));
      const { database } = await pingCultureDatabase2();
      return { connected: true, database };
    }),
    importCuratedPilot: ownerProcedure.mutation(() => importCuratedCulturePilot())
  })
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/sdk.ts
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client2) {
    this.client = client2;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client2 = createOAuthHttpClient()) {
    this.client = client2;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app, pathPrefix = "/manus-storage") {
  app.get(`${pathPrefix}/*`, async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/app.ts
function createApp({ storagePathPrefix = "/manus-storage" } = {}) {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app, storagePathPrefix);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  return app;
}

// server/vercelHandler.ts
var vercelHandler_default = createApp({ storagePathPrefix: "/api/manus-storage" });
export {
  vercelHandler_default as default
};
