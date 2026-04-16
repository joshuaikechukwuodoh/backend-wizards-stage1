import postgres from "postgres";

const DATABASE_URL = "postgresql://neondb_owner:npg_ZY5qsGi4XlxA@ep-red-rice-amvfn6h3-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

console.log("Connecting to DB directly with postgres-js...");
const sql = postgres(DATABASE_URL);

try {
  const result = await sql`SELECT 1 as result`;
  console.log("Success:", result);
} catch (error) {
  console.error("Error:", error);
} finally {
  await sql.end();
  process.exit(0);
}
