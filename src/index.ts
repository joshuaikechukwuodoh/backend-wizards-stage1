import { Hono } from "hono";
import { cors } from "hono/cors";
import profiles from "../routes/profiles";

const app = new Hono();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type"]
}));

app.route("/api/profiles", profiles);

app.get("/", (c) => {
  return c.json({ message: "Backend Wizards API is running successfully!", status: 200 });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;