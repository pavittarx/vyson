import { getClient } from "./init.js";
import sampleUrls from "./sample_urls.json";

const generateCode = (num: number) =>{
  const hex = num.toString(16).padStart(3, 'X').padStart(6, 'Y').toUpperCase();

  // Splits hex at interval of 3 and adds hyphen
  return hex.match(/.{1,3}/g)?.join('-') || hex;
}


// Automatically closes the connection after done.
await using client = await getClient();

const TABLE_NAME = "url_shortner";

try{

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


  interface Count {
    count: number;
  }

  const count_query = `SELECT count(*)::int FROM url_shortner;`;
  const count_result = await client.query<Count>(count_query);

  let index = 0;

  for await (const row of count_result) {
    console.log(`Total records in ${TABLE_NAME}:`, row.count);
    index = row.count+1;
  }

  // Insert from sample_urls.json
  for(const url of sampleUrls){ 
    const check_query = `
      SELECT COUNT(*)::int FROM url_shortner WHERE original_url = $1;
    `;

    const check_result = await client.query<Count>(check_query, [url]);

    for await (const row of check_result) {
      if(row.count > 0){
        console.log(`URL already exists: ${url}`);
        continue;
      }
    }

    const insert_query = `
      INSERT INTO url_shortner (original_url, code)
      VALUES ($1, $2)
      ON CONFLICT (code) DO NOTHING;
    `;

    const code = generateCode(index);
    const insert_result = await client.query(insert_query, [url, code]);

    for await (const row of insert_result) {
      console.log(row);
      console.log(`Inserted URL: ${url} with code: ${code}`);
    }

    index++;
  }

}catch (error: any) {
  console.error("Error creating table:", error.message);
}