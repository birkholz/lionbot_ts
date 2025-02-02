import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// Ensure this code only runs on the server
if (typeof window !== "undefined") {
  throw new Error("Database client cannot be used on the client side")
}

const connectionString = process.env["DATABASE_URL"]
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const client = postgres(connectionString)
export const db = drizzle(client)
