import {
  pgTable,
  uuid,
  varchar,
  integer,
  real,
  timestamp,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  gender: varchar("gender", { length: 20 }).notNull(),
  gender_probability: real("gender_probability").notNull(),
  sample_size: integer("sample_size").notNull(),
  age: integer("age").notNull(),
  age_group: varchar("age_group", { length: 20 }).notNull(),
  country_id: varchar("country_id", { length: 10 }).notNull(),
  country_probability: real("country_probability").notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
  }).notNull(),
});
