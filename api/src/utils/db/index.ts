import { Database } from "bun:sqlite";

export const db = new Database("db.sqlite");
db.exec(
  `
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      guildId TEXT NOT NULL,
      emoji TEXT NOT NULL,
      message TEXT
    )
  `
);
