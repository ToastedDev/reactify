import { api } from "@/utils/api";
import { replaceContent, type PartialMessage } from "@/utils/template";
import type { Client } from "discord.js";

export default (client: Client<true>) => {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (user.id === client.user.id) return;

    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.partial) await user.fetch();

    const { guild } = reaction.message;
    if (!guild) return;

    const reactions = reaction.count ?? 1;

    const res = await api.guilds[":guildId"].channels.$get({
      param: {
        guildId: guild.id,
      },
    });
    const channels = await res.json();
    const channel = channels.find(
      (channel) => reaction.emoji.name === channel.emoji
    );
    if (!channel || reactions < channel.minReactions) return;

    const dcChannel =
      guild.channels.cache.get(channel.id) ??
      (await guild.channels.fetch(channel.id));
    if (!dcChannel || !dcChannel.isTextBased()) return;

    const messageRes = await api.messages[":id"].$get({
      param: {
        id: reaction.message!.id,
      },
    });
    if (messageRes.status == 404) {
      const dbMessage = {
        content: reaction.message.content!,
        url: reaction.message.url,
        createdAt: reaction.message.createdAt.toISOString(),
        author: {
          username: reaction.message.author!.username,
          avatar: reaction.message.author!.displayAvatarURL(),
        },
        attachment: reaction.message.attachments.first(),
      } satisfies PartialMessage;
      const message = replaceContent(channel.message, {
        message: dbMessage,
        reactions: reaction.count ?? 1,
        emoji: channel.emoji,
      });
      const msg = await dcChannel.send(message);
      await msg.react(channel.emoji);
      await api.messages[":id"].$post({
        param: {
          id: reaction.message.id,
        },
        json: {
          botMessageId: msg.id!,
          reactions: reaction.count ?? 1,
          message: {
            ...dbMessage,
            attachment: reaction.message.attachments.first()?.url,
          },
        },
      });
    } else {
      const data = await messageRes.json();
      const newReactions = data.reactions + 1;
      const message = replaceContent(channel.message, {
        message: data.message,
        reactions: newReactions,
        emoji: channel.emoji,
      });
      const msg = await dcChannel.messages.fetch(data.botMessageId);
      await msg.edit(message);
      await api.messages[":id"].$put({
        param: {
          id: data.id,
        },
        json: {
          reactions: newReactions,
        },
      });
    }
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    if (user.id === client.user.id) return;

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
      (channel) => reaction.emoji.name === channel.emoji
    );
    if (!channel) return;

    const dcChannel =
      guild.channels.cache.get(channel.id) ??
      (await guild.channels.fetch(channel.id));
    if (!dcChannel || !dcChannel.isTextBased()) return;

    const messageRes = await api.messages[":id"].$get({
      param: {
        id: reaction.message!.id,
      },
    });
    if (messageRes.status == 404) return;

    const data = await messageRes.json();
    const newReactions = data.reactions - 1;
    const message = replaceContent(channel.message, {
      message: data.message,
      reactions: newReactions,
      emoji: channel.emoji,
    });
    const msg = await dcChannel.messages.fetch(data.botMessageId);
    await msg.edit(message);
    await api.messages[":id"].$put({
      param: {
        id: data.id,
      },
      json: {
        reactions: newReactions,
      },
    });
  });
};
