import type { Client } from "ts-postgres";

type User = {
  id: number;
  name: string;
  email: string;
};

type Todo = {
  id: number;
  title: string;
  userId: number;
  status?: "pending" | "in_progress" | "completed";
  created_at?: string;
  due_date?: string;
};

type CreateTodo = Omit<Todo, "id">;
type CreateUser = Omit<User, "id">;

export class DatabaseManager {
  // Placeholder for future database operations
  constructor(private readonly client: Client) {}

  async getCount(tableName: string) {
    const count_query = `SELECT count(*)::int FROM ${tableName};`;
    const count_result = await this.client.query(count_query);

    for await (const row of count_result) {
      return row.count;
    }

    return -1;
  }

  async createUser({ name, email }: CreateUser) {
    const exists = await this.client.query(
      `
      SELECT 1 FROM users WHERE email = $1;
    `,
      [email]
    );

    console.log("Exists", exists.rows);

    if (exists.rows.length > 0) {
      console.log("User already exists with email:", email);
      return;
    }

    await this.client.query(
      `
      INSERT INTO users(name, email) VALUES($1, $2);
    `,
      [name, email]
    );
  }

  async createTodo({ title, userId }: CreateTodo) {
    await this.client.query(
      `
      INSERT INTO todos(title, userId) VALUES($1, $2);
    `,
      [title, userId]
    );
  }

  async createUsersBulk(users: CreateUser[]) {
    if (users.length === 0) return;
    const valuesPlaceholder = users
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
      .join(", ");
    const values = users.flatMap((u) => [u.name, u.email]);
    return await this.client.query(
      `INSERT INTO users(name, email) 
        VALUES ${valuesPlaceholder} 
        ON CONFLICT (email) DO NOTHING
        RETURNING id;`,
      values
    );
  }

  async createTodosBulk(todos: CreateTodo[]) {
    if (todos.length === 0) return;
    // Support optional status, created_at, due_date fields
    const fields = ["title", "userId", "status", "created_at", "dueDate"];

    const valuesPlaceholder = todos
      .map(
        (_, i) =>
          `(${fields
            .map((_, j) => `$${i * fields.length + j + 1}`)
            .join(", ")})`
      )
      .join(", ");

    const values = todos.flatMap((todo) => fields.map((f) => (todo as any)[f]));

    await this.client.query(
      `INSERT INTO todos(${fields.join(", ")}) VALUES ${valuesPlaceholder};`,
      values
    );
  }
}
