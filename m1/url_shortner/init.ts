import { connect } from "ts-postgres";

// Ideally should be kept in an .env
// since it is a sample project and uses local db, kept here for simplicity
const connectionConfig = {
  host: "localhost",
  port: 5432,
  user: "appuser",
  password: "apppass",
};

const database = "url_shortner";

export const getClient = async () => {
  console.log(`Connecting to database ${database}...`);

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

  const client = await connect({
    ...connectionConfig,
    database,
  });

  console.log(`Connected to database ${database}`);

  return client;
};
