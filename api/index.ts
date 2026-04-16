import { Hono } from "hono";
import { cors } from "hono/cors";
import profiles from "../routes/profiles";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/", (c) => {
  return c.json({ message: "Backend Wizards API is running successfully!", status: 200 });
});

app.route("/api/profiles", profiles);

// IMPORTANT: THIS MAKES VERCEL SEE YOUR APP
export default app.fetch;
