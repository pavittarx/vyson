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
  const users = [{
    name: 'Rick',
    email: "rick@mail.com"
  }, {
    name: 'Walter',
    email: 'walter@mail.com'
  },
  {
    name: 'John',
    email: 'john@mail.com'
  }, {
    name: 'Jane',
    email: 'jane@mail.com'
  }, {
    name: 'David',
    email: 'david@mail.com'
  }]

  for (const user of users) {
    await createUser(user);
  }

  const todos = [
    {title: 'Buy groceries', userId: 1},
    {title: 'Walk the dog', userId: 8},
    {title: 'Do laundry', userId: 4},
    {title: 'Prepare dinner', userId: 3},
    {title: 'Read a book', userId: 5},
    {title: 'Go for a run', userId: 6},
    {title: 'Clean the house', userId: 4},
    {title: 'Do laundry', userId: 7},
    {title: 'Prepare dinner', userId: 3},
  ];

  for (const todo of todos) {
    await createTodo(todo);
  }
}

await main();