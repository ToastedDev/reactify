import type { Message } from "discord.js";

export function replaceContent(
  obj: string | any[] | Record<string, any>,
  message: Message,
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
        obj.embeds = [replaceContent(obj[key], message, reactions)];
      } else {
        obj[key] = replaceContent(obj[key], message, reactions);
      }
    }
  }
  return obj;
}
