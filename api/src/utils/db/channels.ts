import { db, type Sqlify } from ".";

export interface Channel {
  id: string;
  guildId: string;
  emoji: string;
  message: {
    content: string;
    //TODO
    embed?: any;
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
