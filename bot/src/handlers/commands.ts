import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type ApplicationCommandData,
  type ApplicationCommandOptionData,
  type ApplicationCommandSubCommandData,
  type ApplicationCommandSubGroupData,
  type ChatInputApplicationCommandData,
  type ChatInputCommandInteraction,
  type Client,
  type PermissionResolvable,
} from "discord.js";
import { importDefault } from "@/utils/import";
import { inspect } from "node:util";
import { config } from "@/config";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { slashCommandPermissions } from "@/utils/constants/permissions";

export interface Command
  extends Omit<
    ChatInputApplicationCommandData,
    "name" | "defaultMemberPermissions" | "dmPermission"
  > {
  run: (interaction: ChatInputCommandInteraction) => any;
}

export default (client: Client<true>) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const commandSegments = [
      interaction.commandName,
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false),
    ].filter(Boolean);

    try {
      const command = await importDefault<Command>(
        `../commands/${interaction.commandName}`
      );
      return await command.run(interaction);
    } catch (err) {
      console.error(
        `Failed to run chat input command /${commandSegments.join(
          " "
        )}: ${inspect(err)}`
      );
    }
  });
};

export function registerCommands(client: Client<true>) {
  const commands = config.guildId
    ? client.guilds.cache.get(config.guildId)?.commands
    : client.application.commands;
  if (!commands)
    throw new Error("Could not find guild with ID " + config.guildId);
  nestCommands("../commands")
    .then((c) => commands.set(c))
    .then(() => console.log("Commands registered."));
}

type SubcommandOptions = Exclude<
  ApplicationCommandOptionData,
  ApplicationCommandSubGroupData | ApplicationCommandSubCommandData
>;

async function nestCommands(path: string): Promise<ApplicationCommandData[]> {
  const files = await readdir(join(__dirname, path));
  const commands: ApplicationCommandData[] = [];
  for (const fileName of files.filter(
    (file) => !file.startsWith("_") && !file.startsWith("index")
  )) {
    if (fileName.includes(".")) {
      const command = await importDefault<Command>(`${path}/${fileName}`);
      const name = fileName.split(".")[0];
      commands.push({
        name,
        type: ApplicationCommandType.ChatInput,
        description: command.description,
        ...(command.options && { options: command.options }),
        dmPermission: false,
        defaultMemberPermissions: slashCommandPermissions[fileName] ?? null,
      });
    } else {
      const subCommands = await (async function nestSubCommands(
        subPath: string
      ) {
        const subFiles = await readdir(join(__dirname, subPath));
        const subArr: Array<
          ApplicationCommandSubCommandData | ApplicationCommandSubGroupData
        > = [];
        for (const subFileName of subFiles.filter(
          (file) => !file.startsWith("_")
        )) {
          if (subFileName.includes(".")) {
            const command = await importDefault<Command>(
              require.resolve(`${subPath}/${subFileName}`)
            );
            subArr.push({
              type: ApplicationCommandOptionType.Subcommand,
              name: subFileName.split(".")[0]!,
              description: command.description,
              options: (command.options as SubcommandOptions[]) ?? [],
            });
          } else {
            const subSubCommands = await nestSubCommands(
              join(subPath, subFileName)
            );
            subArr.push({
              type: ApplicationCommandOptionType.SubcommandGroup,
              name: subFileName,
              description: "Subcommand",
              options: subSubCommands as never,
            });
          }
        }
        return subArr;
      })(`${path}/${fileName}`);
      if (subCommands.length) {
        commands.push({
          name: fileName,
          type: ApplicationCommandType.ChatInput,
          description: "Sub-command",
          options: subCommands,
          defaultMemberPermissions: slashCommandPermissions[fileName] ?? null,
        });
      }
    }
  }
  return commands;
}
