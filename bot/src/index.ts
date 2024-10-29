import { Client, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config";
import handleCommands, { registerCommands } from "./handlers/commands";
import handleReactions from "./handlers/reactions";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.on("ready", (trueClient) => {
  console.log(`Logged in as ${trueClient.user.tag}.`);

  registerCommands(trueClient);
  handleCommands(trueClient);
  handleReactions(trueClient);
});

client.login(config.token);
