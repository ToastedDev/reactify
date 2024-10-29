export const config = {
  token: String(process.env.DISCORD_TOKEN),
  guildId: process.env.DISCORD_GUILD_ID ?? null,
} as const;
