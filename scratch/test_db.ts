import { db } from "../db";
import { profiles } from "../db/schema";

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("Testing DB connection...");
try {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const result = await db.select().from(profiles).limit(1);
  console.log("DB connection successful:", result);
} catch (error) {
  console.error("DB connection failed:", error);
} finally {
  process.exit(0);
}
