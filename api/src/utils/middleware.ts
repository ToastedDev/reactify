import type { Context, Next } from "hono";

export async function onlyAllowInternalRequests(c: Context, next: Next) {
  if (c.req.header("Authorization") !== process.env.AUTH_TOKEN)
    return c.json({ error: "Unauthorized" }, 401);
  return next();
}
