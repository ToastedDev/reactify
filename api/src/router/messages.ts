import { Hono } from "hono";
import { onlyAllowInternalRequests } from "../utils/middleware";
import {
  createMessage,
  getMessage,
  updateReactions,
} from "../utils/db/messages";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const messagesRouter = new Hono()
  .get("/:id", onlyAllowInternalRequests, async (c) => {
    const { id } = c.req.param();
    const message = getMessage(id);
    if (!message) return c.json({ error: "Message not found" }, 404);
    return c.json(message);
  })
  .post(
    "/:id",
    onlyAllowInternalRequests,
    zValidator(
      "json",
      z.object({
        botMessageId: z.string(),
        reactions: z.number(),
        message: z.object({
          content: z.string(),
          author: z.object({
            username: z.string(),
            avatar: z.string(),
          }),
          attachment: z.string().optional(),
        }),
      })
    ),
    async (c) => {
      const { id } = c.req.param();
      const { botMessageId, reactions, message } = c.req.valid("json");

      createMessage({
        id,
        botMessageId,
        reactions,
        message: message,
      });

      return c.json({ success: true }, 201);
    }
  )
  .put(
    "/:id",
    onlyAllowInternalRequests,
    zValidator(
      "json",
      z.object({
        reactions: z.number(),
      })
    ),
    async (c) => {
      const { id } = c.req.param();
      const { reactions } = c.req.valid("json");

      updateReactions(id, reactions);

      return c.json({ success: true }, 200);
    }
  );
