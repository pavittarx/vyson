import { generateTodos, generateUsers } from "./generator.js";
import { getClient } from "./init.js";
import { DatabaseManager } from "./database.js";

async function main() {
  const client = await getClient();
  const db = new DatabaseManager(client);
  try {
    const totalInserts = 1000000;
    const stepSize = 1000;
    const start = performance.now();

    for (let i = 0; i < totalInserts; i += stepSize) {
      const users = generateUsers(stepSize);
      const result = await db.createUsersBulk(users);

      if (!result) {
        console.log(
          "No new users were added in this batch, skipping todo creation."
        );
        continue;
      }

      const userIds: number[] = result.map((row: any) => row.id);

      if (userIds.length === 0) {
        console.log("No user IDs returned, skipping todo creation.");
        continue;
      }

      const todos = generateTodos(stepSize * 10, userIds);
      await db.createTodosBulk(todos);

      console.log(`Inserted ${i + stepSize} records so far...`);
    }

    console.log(
      `Total Time for ${totalInserts} insertions:`,
      performance.now() - start
    );
  } finally {
    await client.end();
  }
}

main();
