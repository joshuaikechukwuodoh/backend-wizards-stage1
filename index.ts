import { Hono } from "hono";
import { cors } from "hono/cors";
import profiles from "./routes/profiles";

const app = new Hono();

app.use("*", cors({ origin: "*" }));

app.route("/api/profiles", profiles);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;
