import { Db, MongoClient } from 'mongodb';
import { SETTINGS } from '../settings/config';
import { initCollections } from './collections';

export let client: MongoClient;

// Подключение к БД
export async function runDB(url: string): Promise<void> {
  // Небольшой пул соединений: важно на serverless (Vercel), где может быть
  // много параллельных "холодных" инстансов функции — каждый со своим пулом.
  client = new MongoClient(url, { maxPoolSize: 5 });
  const db: Db = client.db(SETTINGS.DB_NAME);

  // Инициализируем коллекции из подключённой базы.
  initCollections(db);

  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log('✅ Connected to the database');
  } catch (e) {
    await client.close();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}

// для тестов
export async function stopDb() {
  if (!client) {
    throw new Error(`❌ No active client`);
  }
  await client.close();
}

// Мемоизированный промис подключения: гарантирует, что runDB() выполнится
// только один раз, даже если несколько запросов "постучатся" в middleware
// одновременно, пока идёт первое подключение (актуально для serverless).
let connectionPromise: Promise<void> | null = null;

export function ensureDbConnected(): Promise<void> {
  if (!connectionPromise) {
    connectionPromise = runDB(SETTINGS.MONGO_URL);
  }
  return connectionPromise;
}
