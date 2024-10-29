import type { PermissionResolvable } from "discord.js";

export const slashCommandPermissions: Record<
  string,
  PermissionResolvable | null
> = {
  ping: null,
  channels: ["ManageChannels"],
};
