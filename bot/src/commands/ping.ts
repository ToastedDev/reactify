import type { Command } from "@/handlers/commands";

export default {
  description: "Pings the bot",
  run: (interaction) => interaction.reply("Pong!"),
} satisfies Command;
