/**
 * Profile management routes for Backend Wizards Stage 1.
 * Handles CRUD operations and metadata enrichment from external APIs.
 */
import { Hono } from "hono";
import { db } from "../db";
import { profiles } from "../db/schema";
import { fetchExternal } from "../services/external";
import { getAgeGroup, getTopCountry } from "../utils/classifiers";
import { v4 as uuidv4 } from "uuid";
import { eq, ilike, and, desc } from "drizzle-orm";

const app = new Hono();

app.post("/", async (c) => {
    let name: string | undefined;
    try {
      const body = await c.req.json();
      name = body.name;
    
    if (!name) {
      return c.json({ status: "error", message: "Name is required" }, 400);
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
    
    return c.json({
      status: "success",
      data: newProfile
    }, 201);
  } catch (error: any) {
    console.error("Error creating profile:", error);
    
    const originalError = error.cause || error;
    const isUniqueViolation = 
      originalError.code === '23505' || 
      originalError.message?.toLowerCase().includes("unique constraint") || 
      originalError.message?.toLowerCase().includes("already exists") ||
      originalError.constraint_name?.includes("unique");

    if (isUniqueViolation) {
      // Find the existing profile to ensure full idempotency (return 200 OK)
      const [existingProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.name, name!));
      
      if (existingProfile) {
        return c.json({
          status: "success",
          data: existingProfile
        }, 200);
      }
    }
    
    // Check if the error is from external services (likely an invalid name)
    const isServiceError = error.message?.includes("returned an invalid response");
    const statusCode = isServiceError ? 400 : 500;
    
    return c.json({ 
      status: "error", 
      message: error.message || "Failed to create profile" 
    }, statusCode);
  }
});

app.get("/", async (c) => {
  try {
    console.log("GET /api/profiles hit");
    const gender = c.req.query("gender");
    const ageGroup = c.req.query("age_group");
    const name = c.req.query("name");
    const countryId = c.req.query("country_id");

    let query = db.select().from(profiles).orderBy(desc(profiles.created_at));
    const conditions = [];

    if (gender) {
      conditions.push(ilike(profiles.gender, gender));
    }
    if (ageGroup) {
      conditions.push(ilike(profiles.age_group, ageGroup));
    }
    if (name) {
      conditions.push(ilike(profiles.name, `%${name}%`));
    }
    if (countryId) {
      conditions.push(ilike(profiles.country_id, countryId));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    const result = await query;
    return c.json({
      status: "success",
      count: result.length,
      data: result
    });
  } catch (error: any) {
    return c.json({ 
      status: "error", 
      message: error.message || "Failed to fetch profiles" 
    }, 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    
    if (!profile) {
      return c.json({ status: "error", message: "Profile not found" }, 404);
    }
    
    return c.json({
      status: "success",
      data: profile
    });
  } catch (error: any) {
    return c.json({ 
      status: "error", 
      message: error.message || "Failed to fetch profile" 
    }, 500);
  }
});

app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db.delete(profiles).where(eq(profiles.id, id));
    
    return c.body(null, 204);
  } catch (error: any) {
    return c.json({ 
      status: "error", 
      message: error.message || "Failed to delete profile" 
    }, 500);
  }
});

export default app;
