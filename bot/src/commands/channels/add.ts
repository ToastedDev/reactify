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
    {
      name: "minimum",
      description:
        "The minimum number of reactions to be sent into the channel",
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
  run: async (interaction) => {
    const channel =
      interaction.options.getChannel("channel") ?? interaction.channel;
    const emoji = interaction.options.getString("emoji", true);
    const minimum = interaction.options.getInteger("minimum");
    await api.guilds[":guildId"].channels.$post({
      param: {
        guildId: interaction.guildId,
      },
      json: {
        id: channel.id,
        emoji,
        minReactions: minimum ?? 1,
      },
    });

    interaction.reply({
      content: `Added channel ${channel} with emoji ${emoji}`,
      ephemeral: true,
    });
  },
} satisfies Command;
