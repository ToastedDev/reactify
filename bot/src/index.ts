import { Client, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config";
import commands, { registerCommands } from "./handlers/commands";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.on("ready", (trueClient) => {
  console.log(`Logged in as ${trueClient.user.tag}.`);

  registerCommands(trueClient);
  commands(trueClient);
});

client.login(config.token);
