import { MongoClient, ServerApiVersion, type Db } from "mongodb";

const DEFAULT_DATABASE_NAME = "india_culture_explorer";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error("MongoDB is not configured. Add MONGODB_URI in the project secrets.");
  }

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI must use a mongodb:// or mongodb+srv:// connection string.");
  }

  return uri;
}

export function getCultureDatabaseName(): string {
  return process.env.MONGODB_DB_NAME?.trim() || DEFAULT_DATABASE_NAME;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (client) return client;

  if (!clientPromise) {
    const nextClient = new MongoClient(getMongoUri(), {
      connectTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 10_000,
      serverApi: {
        version: ServerApiVersion.v1,
        // Atlas text indexes are not available in strict Stable API mode.
        strict: false,
        deprecationErrors: true,
      },
    });

    clientPromise = nextClient
      .connect()
      .then((connectedClient) => {
        client = connectedClient;
        return connectedClient;
      })
      .catch(async (error: unknown) => {
        clientPromise = null;
        await nextClient.close().catch(() => undefined);
        throw new Error("Unable to connect to MongoDB Atlas.", { cause: error });
      });
  }

  return clientPromise;
}

export async function getCultureDb(): Promise<Db> {
  const connectedClient = await getMongoClient();
  return connectedClient.db(getCultureDatabaseName());
}

export async function pingCultureDatabase(): Promise<{ database: string }> {
  const db = await getCultureDb();
  await db.command({ ping: 1 });
  return { database: getCultureDatabaseName() };
}

/** Test-only cleanup for a process that should otherwise keep a reusable MongoDB client. */
export async function closeMongoClientForTests(): Promise<void> {
  const activeClient = client;
  client = null;
  clientPromise = null;

  if (activeClient) {
    await activeClient.close();
  }
}
