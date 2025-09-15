import { generateTodos, generateUsers } from "./generator.js";
import { getClient } from "./init.js";
import { DatabaseManager } from "./database.js";
import { create } from "node:domain";

const client = await getClient();
const db = new DatabaseManager(client);

// async function main() {
//   const totalInserts = 100000;
//   const stepSize = 1200;
//   const start = performance.now();

//   for (let i = 0; i < totalInserts; i += stepSize) {
//     const users = generateUsers(stepSize);
//     const result = await db.createUsersBulk(users);

//     if (!result) {
//       console.log(
//         "No new users were added in this batch, skipping todo creation."
//       );
//       continue;
//     }

//     const userIds: number[] = result.map((row: any) => row.id);

//     if (userIds.length === 0) {
//       console.log("No user IDs returned, skipping todo creation.");
//       continue;
//     }

//     const todos = generateTodos(stepSize * 10, userIds);
//     await db.createTodosBulk(todos);

//     console.log(`Inserted ${i + stepSize} records so far...`);
//   }

//   console.log(
//     `Total Time for ${totalInserts} insertions:`,
//     performance.now() - start
//   );
// }

async function createTodosForExistingUsers() {
  const users = await client.query("SELECT id FROM users LIMIT 1000;");

  const userIds: number[] = users.rows.map((row: any) => row.id);

  if (userIds.length === 0) {
    console.log("No users found in the database.");
    return;
  }

  const totalCount = 10000000;
  const stepSize = 5000;

  for (let i = 0; i < totalCount; i += stepSize) {
    const todos = generateTodos(stepSize, userIds);
    await db.createTodosBulk(todos);
  }
}

// await main();
await createTodosForExistingUsers();
await client.end();
