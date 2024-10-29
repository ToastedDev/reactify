import { db } from ".";

interface Message {
  id: string;
  botMessageId: string;
  reactions: number;
  message: {
    content: string;
    author: {
      username: string;
    };
  };
}

type DBMessage = Message & {
  message: string;
};

function formatMessage(channel: DBMessage) {
  return {
    id: channel.id,
    botMessageId: channel.botMessageId,
    reactions: channel.reactions,
    message: JSON.parse(channel.message),
  };
}

export function getMessage(id: string) {
  const message = db
    .query("SELECT * FROM messages WHERE id = ? OR botMessageId = ?")
    .get(id, id);
  if (message) return formatMessage(message as DBMessage);
  else return null;
}

export function createMessage(message: Message) {
  return db.exec(
    `INSERT INTO messages (id, botMessageId, reactions, message) VALUES (?, ?, ?, ?)`,
    [
      message.id,
      message.botMessageId,
      message.reactions,
      JSON.stringify(message.message),
    ]
  );
}

export function updateReactions(id: string, reactions: number) {
  return db.exec(`UPDATE messages SET reactions = ? WHERE id = ?`, [
    reactions,
    id,
  ]);
}