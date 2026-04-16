import { Hono } from "hono";
import { db } from "../db";
import { profiles } from "../db/schema";
import { fetchExternal } from "../services/external";
import { getAgeGroup, getTopCountry } from "../utils/classifiers";
import { v4 as uuidv4 } from "uuid";
import { eq, ilike, and } from "drizzle-orm";

const app = new Hono();

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { name } = body;
    
    if (!name) {
      return c.json({ error: "Name is required" }, 400);
    }

    const { gender, age, nation } = await fetchExternal(name);
    const topCountry = getTopCountry(nation.country);
    
    const newProfile = {
      id: uuidv4(),
      name,
      gender: gender.gender,
      gender_probability: gender.probability,
      sample_size: gender.count,
      age: age.age,
      age_group: getAgeGroup(age.age),
      country_id: topCountry.country_id,
      country_probability: topCountry.probability,
      created_at: new Date(),
    };

    await db.insert(profiles).values(newProfile);
    
    return c.json(newProfile, 201);
  } catch (error: any) {
    console.error("Error creating profile:", error);
    
    if (error.message?.includes("unique constraint") || error.code === '23505') {
      return c.json({ error: "A profile with this name already exists" }, 409);
    }
    
    return c.json({ error: error.message || "Failed to create profile" }, 500);
  }
});

app.get("/", async (c) => {
  try {
    console.log("GET /api/profiles hit");
    const gender = c.req.query("gender");
    const ageGroup = c.req.query("age_group");
    const name = c.req.query("name");

    let query = db.select().from(profiles);
    const conditions = [];

    if (gender) {
      conditions.push(eq(profiles.gender, gender));
    }
    if (ageGroup) {
      conditions.push(eq(profiles.age_group, ageGroup));
    }
    if (name) {
      conditions.push(ilike(profiles.name, `%${name}%`));
    }

    if (conditions.length > 0) {
      // @ts-ignore - Dynamic conditions in drizzle can be complex to type correctly here
      query = query.where(and(...conditions));
    }

    const result = await query;
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to fetch profiles" }, 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }
    
    return c.json(profile);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to fetch profile" }, 500);
  }
});

app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db.delete(profiles).where(eq(profiles.id, id));
    
    return c.json({ message: "Profile deleted successfully" });
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to delete profile" }, 500);
  }
});

export default app;
