import { getClient } from "./init.js";

// Automatically closes the connection after done.
await using client = await getClient();


