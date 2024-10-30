import { Hono } from "hono";
import { onlyAllowInternalRequests } from "../utils/middleware";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  addChannel,
  deleteChannel,
  getChannels,
  type Channel,
} from "../utils/db/channels";

const defaultMessage: Channel["message"] = {
  embed: {
    author: {
      name: "%author.username%",
      iconURL: "%author.avatar%",
    },
    description: "%content%\n[**Click to jump to message!**](<%url%>)",
    footer: {
      text: "%reactions%",
    },
    color: "#5865F2",
    timestamp: true,
  },
};

export const channelsRouter = new Hono()
  .get("/guilds/:guildId/channels", onlyAllowInternalRequests, async (c) => {
    const { guildId } = c.req.param();
    return c.json(getChannels(guildId));
  })
  .post(
    "/guilds/:guildId/channels",
    onlyAllowInternalRequests,
    zValidator(
      "json",
      z.object({
        id: z.string(),
        emoji: z.string(),
        minReactions: z.number().optional(),
      })
    ),
    async (c) => {
      const { guildId } = c.req.param();

      const { id, emoji, minReactions = 1 } = c.req.valid("json");
      await addChannel({
        id,
        guildId,
        emoji,
        message: defaultMessage,
        minReactions,
      });

      return c.json({ success: true }, 201);
    }
  )
  .delete(
    "/guilds/:guildId/channels",
    onlyAllowInternalRequests,
    zValidator(
      "json",
      z.object({
        id: z.string(),
      })
    ),
    async (c) => {
      const { guildId } = c.req.param();
      const { id } = c.req.valid("json");
      await deleteChannel(id, guildId);
      return c.json({ success: true }, 200);
    }
  );
