import { Hono } from "hono";
import { onlyAllowInternalRequests } from "../utils/middleware";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { addChannel, getChannels, type Channel } from "../utils/db/channels";

const defaultMessage: Channel["message"] = {
  content: "%content% %reactions%",
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
      })
    ),
    async (c) => {
      const { guildId } = c.req.param();

      const { id, emoji } = c.req.valid("json");
      await addChannel({
        id,
        guildId,
        emoji,
        message: defaultMessage,
      });

      return c.json({ success: true }, 201);
    }
  );
