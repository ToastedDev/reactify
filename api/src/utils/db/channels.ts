import { db } from ".";

function Json(target: any, key: string) {
  let value = target[key];

  Object.defineProperty(target, key, {
    get: () => (typeof value === "string" ? JSON.parse(value) : value),
    set: (newValue) => {
      value = newValue;
    },
    enumerable: true,
    configurable: true,
  });
}

export interface Channel {
  id: string;
  guildId: string;
  emoji: string;
  message: {
    content: string;
  };
}

export class Channel implements Channel {
  id!: string;
  guildId!: string;
  emoji!: string;
  @Json
  message!: {
    content: string;
  };
}

export function getChannel(id: string) {
  return db.query("SELECT * FROM channels WHERE id = ?").as(Channel).get(id);
}

export async function addChannel(channel: Channel) {
  db.query("INSERT INTO channels (id, emoji, message) VALUES (?, ?, ?)").run(
    channel.id,
    channel.emoji,
    JSON.stringify(channel.message)
  );
}
