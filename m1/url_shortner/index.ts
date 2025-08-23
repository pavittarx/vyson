import { getClient } from "./init";
import sampleUrls from "./sample_urls.json";
import { DatabaseManager } from "./operations";

const generateCode = (num: number) => {
  const hex = num.toString(16).padStart(3, "X").padStart(6, "Y").toUpperCase();

  // Splits hex at interval of 3 and adds hyphen
  return hex.match(/.{1,3}/g)?.join("-") || hex;
};

const generateRandomUrls = (count: number) => {
  const urls = [];

  for (let i = 0; i < count; i++) {
    const randomUrl = `https://example.com/${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    urls.push(randomUrl);
  }

  return urls;
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

    const count_query = `SELECT count(*)::int FROM url_shortner;`;
    const count_result = await client.query(count_query);

    let index = 0;

    for await (const row of count_result) {
      console.log(`Total records in ${TABLE_NAME}:`, row.count);
      index = row.count + 1;
    }

    // Insert from sample_urls.json
    for (const url of sampleUrls) {
      await db.insertIntoDatabase(url, generateCode(index));
      index++;
    }

    const urlCount = 1000000;
    const randomUrls = generateRandomUrls(urlCount);

    const startTime = performance.now();
    for (const url of randomUrls) {
      await db.insertIntoDatabase(url, generateCode(index));
      index++;
    }

    const endTime = performance.now();

    console.log(
      `Total Time taken to insert ${urlCount} URLs:`,
      endTime - startTime,
      "ms"
    );
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

main();
