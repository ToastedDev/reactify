import type { Command } from "@/handlers/commands";
import { api } from "@/utils/api";
import { ApplicationCommandOptionType } from "discord.js";

export default {
  description: "Removes a channel",
  options: [
    {
      name: "channel",
      description: "The channel to remove",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  run: async (interaction) => {
    const channel =
      interaction.options.getChannel("channel") ?? interaction.channel;
    await api.guilds[":guildId"].channels.$delete({
      param: {
        guildId: interaction.guildId,
      },
      json: {
        id: channel.id,
      },
    });

    interaction.reply({
      content: `Removed channel ${channel}`,
      ephemeral: true,
    });
  },
} satisfies Command;
