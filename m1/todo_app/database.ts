import { Client } from "pg";

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
  createdAt?: string;
  dueDate?: string;
  priority?: number;
};

type CreateTodo = Omit<Todo, "id">;
type CreateUser = Omit<User, "id">;

export class DatabaseManager {
  // Placeholder for future database operations
  constructor(private readonly client: Client) {}

  async getCount(tableName: string) {
    const count_query = `SELECT count(*)::int FROM ${tableName};`;
    const count_result = await this.client.query(count_query);
    if (count_result.rows.length > 0) {
      return count_result.rows[0].count;
    }
    return 0;
  }

  async createUser({ name, email }: CreateUser) {
    const exists = await this.client.query(
      `
      SELECT 1 FROM users WHERE email = $1;
    `,
      [email]
    );

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

  async createTodo({ title, userId, createdAt, dueDate }: CreateTodo) {
    await this.client.query(
      `
      INSERT INTO todos(title, userid, createdat, duedate) VALUES($1, $2, $3, $4);
    `,
      [title, userId, createdAt, dueDate]
    );
  }

  async createUsersBulk(users: CreateUser[]) {
    if (users.length === 0) return;
    const valuesPlaceholder = users
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
      .join(", ");
    const values = users.flatMap((u) => [u.name, u.email]);
    const result = await this.client.query(
      `INSERT INTO users(name, email) 
        VALUES ${valuesPlaceholder} 
        ON CONFLICT (email) DO NOTHING
        RETURNING id;`,
      values
    );
    return result.rows;
  }

  async createTodosBulk(todos: CreateTodo[]) {
    if (todos.length === 0) return;

    const fields = [
      "title",
      "userId",
      "status",
      "createdAt",
      "dueDate",
      "priority",
    ];

    const valuesPlaceholder = todos
      .map(
        (_, i) =>
          `(${fields
            .map((_, j) => `$${i * fields.length + j + 1}`)
            .join(", ")})`
      )
      .join(", ");

    console.log("Fields:", todos);

    const values = todos.flatMap((todo) => fields.map((f) => (todo as any)[f]));

    await this.client.query(
      `INSERT INTO todos(${fields.join(", ")}) VALUES ${valuesPlaceholder};`,
      values
    );
  }
}
