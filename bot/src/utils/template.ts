import { Attachment, type APIEmbed } from "discord.js";

interface PartialMessage {
  content: string;
  author: {
    username: string;
    avatar: string;
  };
  attachment?: Attachment | string;
}

export function replaceContent(
  obj: string | any[] | Record<string, any>,
  message: PartialMessage,
  reactions: number
): any {
  if (typeof obj === "string") {
    return obj
      .replace("%content%", message.content)
      .replace("%author%", message.author.username)
      .replace("%reactions%", reactions.toLocaleString());
  } else if (Array.isArray(obj)) {
    return obj.map((item) => replaceContent(item, message, reactions));
  } else if (typeof obj === "object" && obj !== null) {
    for (let key in obj) {
      if (key === "embed") {
        console.log(message.attachment);
        obj.embeds = [
          {
            ...replaceContent(obj[key], message, reactions),
            image: {
              url:
                typeof message.attachment === "object"
                  ? message.attachment.url
                  : message.attachment,
            },
          } satisfies APIEmbed,
        ];
      } else {
        obj[key] = replaceContent(obj[key], message, reactions);
        obj.files =
          typeof message.attachment === "object"
            ? [message.attachment]
            : undefined;
      }
    }
  }
  return obj;
}
