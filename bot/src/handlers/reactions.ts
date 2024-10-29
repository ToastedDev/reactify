import { api } from "@/utils/api";
import { replaceContent } from "@/utils/template";
import type { Client, Message } from "discord.js";

export default (client: Client<true>) => {
  client.on("messageReactionAdd", async (reaction, user) => {
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
    if (messageRes.status == 404) {
      const message = replaceContent(
        channel.message,
        reaction.message as Message,
        reaction.count ?? 1
      );
      const msg = await dcChannel.send(message);
      await msg.react(channel.emoji);
      await api.messages[":id"].$post({
        param: {
          id: reaction.message.id,
        },
        json: {
          botMessageId: msg.id,
          reactions: reaction.count ?? 1,
          message: {
            content: reaction.message!.content!,
            author: {
              username: reaction.message!.author!.username,
            },
          },
        },
      });
    } else {
      const data = await messageRes.json();
      const message = replaceContent(
        channel.message,
        data.message as Message,
        data.reactions + 1
      );
      const msg = await dcChannel.messages.fetch(data.botMessageId);
      await msg.edit(message);
      await api.messages[":id"].$put({
        param: {
          id: reaction.message.id,
        },
        json: {
          reactions: data.reactions + 1,
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
    const message = replaceContent(
      channel.message,
      data.message as Message,
      data.reactions + 1
    );
    const msg = await dcChannel.messages.fetch(data.botMessageId);
    await msg.edit(message);
    await api.messages[":id"].$put({
      param: {
        id: reaction.message.id,
      },
      json: {
        reactions: data.reactions + 1,
      },
    });
  });
};
