import { Client } from "pg";

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
  if (count_result.rows.length > 0) {
    return count_result.rows[0].count;
  }
  return 0;
}

async function setupDatabase() {
  console.log(`Setting up Database ${database}`);

  const admin = new Client({
    ...connectionConfig,
    database: "postgres",
  });
  await admin.connect();

  const res = await admin.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [database]
  );
  if (res.rows.length === 0) {
    await admin.query(`CREATE DATABASE "${database}"`);
    console.log(`Created database ${database}`);
  }
  await admin.end();
}

async function setupTables(client: Client) {
  console.log(`Setting up Tables for Database ${database}`);
  console.log(`Table: Users`);

  await client.query(
    `
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email VARCHAR(50) NOT NULL UNIQUE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  );

  console.log("Ready: Users table.");

  await client.query(
    `
      CREATE TABLE IF NOT EXISTS todos(
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        userid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        duedate TIMESTAMP,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT chk_status CHECK (status IN ('pending', 'in_progress', 'completed'))
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

  const client = new Client({
    ...connectionConfig,
    database,
  });
  await client.connect();

  console.log(`Connected to database ${database}`);

  await setupTables(client);

  return client;
};
