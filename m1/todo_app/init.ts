import { connect } from "ts-postgres";
import type { Client } from "ts-postgres";

// Ideally should be kept in an .env
// since it is a sample project and uses local db, kept here for simplicity
const connectionConfig = {
  host: "localhost",
  port: 5432,
  user: "appuser",
  password: "apppass",
};

const database = "todo_app";

async function getCurrentCount(client: Client, table: string) {
  const count_query = `SELECT count(*)::int FROM ${table};`;
  const count_result = await client.query(count_query);

  for await (const row of count_result) {
    return row.count;
  }
}

async function setupDatabase() {
  console.log(`Setting up Database ${database}`);

  const admin = await connect({
    ...connectionConfig,
    database: "postgres",
    keepAlive: false,
  });

  const rows = await admin.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [database]
  );
  if (rows.rows.length === 0) {
    await admin.query(`CREATE DATABASE "${database}"`);
    console.log(`Created database ${database}`);
  }
  await admin.end();
}

async function setupTables(client: Client) {
  console.log(`Setting up Tables for Database ${database}`);
  console.log(`Table: Users`);

  const users_table = await client.query(
    `
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  );

  console.log("Ready: Users table.");

  const todos_table = await client.query(
    `
      CREATE TABLE IF NOT EXISTS todos(
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        isCompleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  );

  console.log("Ready: Todos table.");

  const usersCount = await getCurrentCount(client, "users");
  const todosCount = await getCurrentCount(client, "todos");

  console.log(`Current Records: Users(${usersCount}), Todos(${todosCount})`);
}

export const getClient = async () => {
  await setupDatabase();

  const client = await connect({
    ...connectionConfig,
    database,
  });

  console.log(`Connected to database ${database}`);

  await setupTables(client);

  return client;
};
