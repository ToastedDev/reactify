import { api } from "@/utils/api";
import { replaceContent } from "@/utils/template";
import type { Client, Message } from "discord.js";

export default (client: Client<true>) => {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.partial) await user.fetch();

    const { guild } = reaction.message;
    if (!guild) return;

    const res = await api.guilds[":guildId"].channels.$get({
      param: {
        guildId: guild.id,
      },
    });
    const channels = await res.json();
    const channel = channels.find(
      (channel) => reaction.emoji.name === channel.emoji
    );
    if (!channel) return;

    const message: any = replaceContent(
      channel.message,
      reaction.message as Message,
      reaction.count ?? 1
    );
    if (message.embed) {
      const embed = message.embed;
      delete message.embed;
      message.embeds = [embed];
    }

    const dcChannel = await guild.channels.fetch(channel.id);
    if (!dcChannel || !dcChannel.isTextBased()) return;

    dcChannel.send(message);
  });
};
