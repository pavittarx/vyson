import { generateTodos, generateUsers } from "./generator.js";
import { getClient } from "./init.js";

await using client = await getClient();

async function createUser({name, email}: {name: string, email: string}) {
  const exists = await client.query(
    `
      SELECT 1 FROM users WHERE email = $1;
    `,
    [email]
  );

  console.log("Exists", exists.rows);

  if(exists.rows.length > 0) {
    console.log("User already exists with email:", email);
    return;
  }

  await client.query(
    `
      INSERT INTO users(name, email) VALUES($1, $2);
    `,
    [name, email]
  );
}

const createTodo = async ({ title, userId }: { title: string, userId: number }) => {
  await client.query(
    `
      INSERT INTO todos(title, userId) VALUES($1, $2);
    `,
    [title, userId]
  );
};

async function main(){
  const users = generateUsers(10);

  console.log(users);

  const todos = generateTodos(20, users.length);

  console.log(todos);
}

await main();