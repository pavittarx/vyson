import { generateTodos, generateUsers } from "./generator.js";
import { getClient } from "./init.js";
import { DatabaseManager } from "./database.js";
import { pg } from "squid";

await using client = await getClient();
const db = new DatabaseManager(client);

async function main(){
  const totalInserts = 1000;
  const stepSize = 500;
  const start = performance.now();

  for(let i = 0; i < totalInserts; i+=stepSize){
    const users = generateUsers(stepSize);
    const result = await db.createUsersBulk(users);

    if(!result){
      console.log("No new users were added in this batch, skipping todo creation.");
      continue;
    }

    const userIds: number[] = [];
    for(let row of result){
      userIds.push(row.id);
    }

    const todos = generateTodos(stepSize*10, userIds);
    await db.createTodosBulk(todos);
  }

  console.log(`Total Time for ${totalInserts} insertions:`, performance.now() - start);
}

await main();
