import type { Command } from "@/handlers/commands";
import { api } from "@/utils/api";
import { ApplicationCommandOptionType } from "discord.js";

export default {
  description: "Adds a channel",
  options: [
    {
      name: "channel",
      description: "The channel to add",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "emoji",
      description: "The emoji to look for",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (interaction) => {
    const channel =
      interaction.options.getChannel("channel") ?? interaction.channel;
    const emoji = interaction.options.getString("emoji", true);
    const res = await api.guilds[":guildId"].channels.$post({
      param: {
        guildId: interaction.guildId,
      },
      json: {
        id: channel.id,
        emoji,
      },
    });

    interaction.reply({
      content: `Added channel ${channel} with emoji ${emoji}`,
      ephemeral: true,
    });
  },
} satisfies Command;
