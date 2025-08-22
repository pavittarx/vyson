import type { Client } from "ts-postgres";

export class DatabaseManager {
  constructor(private readonly client: Client) {}

  async insertIntoDatabase(url: string, code: string) {
    const check_query = `
      SELECT COUNT(*)::int FROM url_shortner WHERE original_url = $1;
    `;

    const check_result = await this.client.query(check_query, [url]);

    for await (const row of check_result) {
      if (row.count > 0) {
        console.log(`URL already exists: ${url}`);
        continue;
      }
    }

    const insert_query = `
      INSERT INTO url_shortner (original_url, code)
      VALUES ($1, $2)
      ON CONFLICT (code) DO NOTHING;
    `;

    const insert_result = await this.client.query(insert_query, [url, code]);

    for await (const row of insert_result) {
      console.log(row);
      console.log(`Inserted URL: ${url} with code: ${code}`);
    }
  }
}
