import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'ahlesunnat_portal';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db | null> {
  if (!uri) return null;
  if (db) return db;
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    await db.command({ ping: 1 });
    return db;
  } catch (e) {
    console.error('MongoDB connection failed:', e);
    client = null;
    db = null;
    return null;
  }
}

export async function ensureIndexes() {
  const database = await getDb();
  if (!database) return;

  await Promise.all([
    database.collection('users').createIndex({ email: 1 }, { unique: true }),
    database.collection('articles').createIndex({ slug: 1 }, { unique: true }),
    database.collection('articles').createIndex({ category: 1 }),
    database.collection('articles').createIndex({ publishedAt: -1 }),
    database.collection('comments').createIndex({ articleId: 1 }),
    database.collection('questions').createIndex({ userId: 1 }),
    database.collection('questions').createIndex({ status: 1 }),
    database.collection('questions').createIndex({ category: 1 }),
  ]);
}
