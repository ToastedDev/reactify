import { Attachment, type APIEmbed, resolveColor } from "discord.js";

export interface PartialMessage {
  content: string;
  url: string;
  createdAt: string;
  author: {
    username: string;
    avatar: string;
  };
  attachment?: Attachment | string;
}

export function replaceContent(
  obj: string | any[] | Record<string, any>,
  options: {
    emoji: string;
    message: PartialMessage;
    reactions: number;
  }
): any {
  if (typeof obj === "string") {
    return obj
      .replace("%content%", options.message.content)
      .replace("%author.username%", options.message.author.username)
      .replace("%author.avatar%", options.message.author.avatar)
      .replace("%url%", options.message.url)
      .replace(
        "%reactions%",
        `${options.emoji} ${options.reactions.toLocaleString()}`
      );
  } else if (Array.isArray(obj)) {
    return obj.map((item) => replaceContent(item, options));
  } else if (typeof obj === "object" && obj !== null) {
    for (let key in obj) {
      if (key === "embed") {
        obj.embeds = [
          {
            ...replaceContent(obj[key], options),
            image: {
              url:
                typeof options.message.attachment === "object"
                  ? options.message.attachment.url
                  : options.message.attachment,
            },
          } satisfies APIEmbed,
        ];
      } else {
        obj[key] = replaceContent(obj[key], options);
      }
    }

    if (obj.content && !obj.embeds) {
      obj.files =
        typeof options.message.attachment === "object"
          ? [options.message.attachment]
          : undefined;
    }

    // embed parsing
    if (obj.embed) {
      if (obj.embed.timestamp) {
        obj.embeds[0].timestamp = options.message.createdAt;
      }
      if (obj.embed.color) {
        obj.embeds[0].color = resolveColor(obj.embed.color);
      }
    }
  }
  return obj;
}
