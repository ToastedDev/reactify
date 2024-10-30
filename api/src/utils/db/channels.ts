import { db, type Sqlify } from ".";

export interface Channel {
  id: string;
  guildId: string;
  emoji: string;
  minReactions: number;
  message: {
    content?: string;
    embed?: {
      title?: string;
      description?: string;
      url?: string;
      color?: string;
      thumbnail?: {
        url: string;
      };
      author?: {
        name: string;
        url?: string;
        iconURL?: string;
      };
      fields?: {
        name: string;
        value: string;
        inline?: boolean;
      }[];
      footer?: {
        text: string;
        iconURL?: string;
      };
      timestamp?: boolean;
    };
  };
}

type DBChannel = Sqlify<Channel>;

function formatChannel(channel: DBChannel): Channel {
  return {
    ...channel,
    message: JSON.parse(channel.message),
  };
}

export function getChannels(guildId: string) {
  return db
    .query("SELECT * FROM channels WHERE guildId = ?")
    .all(guildId)
    .map((channel) => formatChannel(channel as DBChannel));
}

export function getChannel(id: string) {
  return formatChannel(
    db.query("SELECT * FROM channels WHERE id = ?").get(id) as DBChannel
  );
}

export async function addChannel(channel: Channel) {
  db.query(
    "INSERT INTO channels (id, guildId, emoji, message) VALUES (?, ?, ?, ?)"
  ).run(
    channel.id,
    channel.guildId,
    channel.emoji,
    JSON.stringify(channel.message)
  );
}

export async function deleteChannel(id: string, guildId: string) {
  db.query("DELETE FROM channels WHERE id = ? AND guildId = ?").run(
    id,
    guildId
  );
}
