import { Database } from "bun:sqlite";

export type Sqlify<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends object
    ? string
    : T[K] extends boolean
    ? 0 | 1
    : T[K];
};

export const db = new Database("db.sqlite");
db.exec(
  `
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      guildId TEXT NOT NULL,
      emoji TEXT NOT NULL,
      message TEXT NOT NULL,
      minReactions INTEGER NOT NULL DEFAULT 1
    )
  `
);
db.exec(
  `
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      botMessageId TEXT NOT NULL,
      reactions INTEGER NOT NULL DEFAULT 1,
      message TEXT NOT NULL
    )
  `
);
