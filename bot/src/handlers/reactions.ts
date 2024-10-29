import { api } from "@/utils/api";
import type { Client } from "discord.js";

export default (client: Client<true>) => {
  client.on("messageReactionAdd", async (reaction, user) => {
    console.log(reaction);
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
      (channel) => channel.id === reaction.message.channelId
    );
    if (!channel || reaction.emoji.id !== channel.emoji) return;
  });
};
