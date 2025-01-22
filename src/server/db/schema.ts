import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `gallery_${name}`);

export const repo = createTable(
    "repo",
    {
      doId: integer("rId").primaryKey().generatedAlwaysAsIdentity(),  // Auto-incrementing task ID
      userId: varchar("userId", { length: 1024 }).notNull(),                // ID of the user who created the task
      filename: varchar("filename", { length: 255 }).notNull(),
      fileurl:varchar("fileurl",{ length: 255 }).notNull(),   
      tags:varchar("tags",{ length: 255 }).notNull(),   
      year:varchar("year",{ length: 255 }).notNull(),   
      branch:varchar("branch",{ length: 255 }).notNull(),              // Task description or title                                       // Date when the task is created or due
      createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),                                                           // Timestamp for task creation
      updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date(),                                                    // Timestamp for task updates
      ),
    },
    (repo) => ({
      userIndex: index("repo_idx").on(repo.userId),                       // Index on userId for faster lookups
    })
  );