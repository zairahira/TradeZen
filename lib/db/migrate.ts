import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { instruments, mistakeTags } from "./schema";
import { DEFAULT_INSTRUMENTS, MISTAKE_TAGS } from "../constants";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "journal.db");
const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite);

migrate(db, { migrationsFolder: path.join(process.cwd(), "lib/db/migrations") });

// Seed instruments
for (const inst of DEFAULT_INSTRUMENTS) {
  db.insert(instruments)
    .values(inst)
    .onConflictDoNothing()
    .run();
}

// Seed mistake tags
for (const tag of MISTAKE_TAGS) {
  db.insert(mistakeTags)
    .values({ name: tag })
    .onConflictDoNothing()
    .run();
}

console.log("Migration and seed complete.");
sqlite.close();
