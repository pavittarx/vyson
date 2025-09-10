// AI Generated for most part,
// Used to generate data for seeding the database and testing.
import { randomBytes } from "node:crypto";

const names = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Heidi",
  "Ivan",
  "Judy",
  "Mallory",
  "Niaj",
  "Olivia",
  "Peggy",
  "Rupert",
  "Sybil",
  "Trent",
  "Uma",
  "Victor",
  "Wendy",
  "Xavier",
  "Yvonne",
  "Zara",
];

const domains = ["example.com", "mail.com", "test.org", "demo.net"];
const statuses = ["pending", "in_progress", "completed"] as const;

function randomName(): string {
  const index = Math.floor(Math.random() * names.length);

  if (index < 0 || index >= names.length) {
    throw new Error("Index out of bounds");
  }

  return names[index] as string;
}

function randomEmail(name: string, i: number) {
  // Use index and random bytes for uniqueness
  const suffix = randomBytes(3).toString("hex");
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${name.toLowerCase()}.${i}.${suffix}@${domain}`;
}

function randomStatus() {
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function randomDateInPastSixMonths(): Date {
  const now = new Date();
  const pastSixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
  const randomPast = now.getTime() - Math.floor(Math.random() * pastSixMonths);
  return new Date(randomPast);
}

function randomDueDate(start: Date): Date {
  const oneMonth = 1000 * 60 * 60 * 24 * 30;
  const randomFuture = start.getTime() + Math.floor(Math.random() * oneMonth);
  return new Date(randomFuture);
}

export function generateUsers(count: number) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const name = randomName();
    users.push({
      name,
      email: randomEmail(name!, i),
    });
  }
  return users;
}

export function generateTodos(count: number, userIds: number[]) {
  const todos = [];
  for (let i = 0; i < count; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const createdAt = randomDateInPastSixMonths();
    const dueDate = randomDueDate(createdAt);
    const status = randomStatus();

    if (!userId || !createdAt || !dueDate || !status) {
      throw new Error("Invalid data generated for todo");
    }

    todos.push({
      title: `Todo #${i + 1}`,
      userId: userId,
      status: status,
      createdAt: createdAt,
      dueDate: dueDate,
    });
  }
  return todos;
}
