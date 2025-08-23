import { getClient } from "./init";
import sampleUrls from "./sample_urls.json";
import { DatabaseManager } from "./operations";
import type { Client } from "ts-postgres";

const generateCode = (num: number) => {
  const hex = num.toString(16).padStart(3, "X").padStart(6, "Y").toUpperCase();

  // Splits hex at interval of 3 and adds hyphen
  return hex.match(/.{1,3}/g)?.join("-") || hex;
};

const generateUrlWithHashCode = (count: number, codeIndex: number) => {
  const urlsWithHash = [];

  for (let i = codeIndex; i < codeIndex + count; i++) {
    const code = generateCode(i);
    const url = `https://example.com/${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    urlsWithHash.push({
      url: url,
      code: code,
    });
  }

  return urlsWithHash;
};

const TABLE_NAME = "url_shortner";

async function getClientAndDatabase() {
  const client = await getClient();
  const db = new DatabaseManager(client);

  return {
    client,
    db,
  };
}

async function currentCount(client: Client, db: DatabaseManager) {
  const count_query = `SELECT count(*)::int FROM url_shortner;`;
  const count_result = await client.query(count_query);

  for await (const row of count_result) {
    console.log(`Total records in ${TABLE_NAME}:`, row.count);
    return row.count;
  }
}

async function inserts(
  index: number,
  db: DatabaseManager,
  batchSize: number = 1000
) {
  const urlCount = 10000000; // 10M rows
  const randomUrls = generateUrlWithHashCode(urlCount, index);

  const startTime = performance.now();

  for (let i = 0; i < randomUrls.length; i += 1000) {
    const batch = randomUrls.slice(i, i + 1000);
    await db.insertBatch(batch);

    console.log("Inserted batch of URLs:", i + 1000);
  }

  const endTime = performance.now();

  console.log(
    `Total Time taken to insert ${urlCount} URLs:`,
    endTime - startTime,
    "ms"
  );
}

async function main() {
  const { client, db } = await getClientAndDatabase();

  try {
    const table_exists = await client.query(
      `
      CREATE TABLE IF NOT EXISTS url_shortner(
        id SERIAL PRIMARY KEY,
        original_url TEXT NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
    );

    for await (const row of table_exists) {
      console.log(`Total records in ${TABLE_NAME}:`, row);
    }

    const count = await currentCount(client, db);
    await inserts(count, db, 5000);
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

main();
