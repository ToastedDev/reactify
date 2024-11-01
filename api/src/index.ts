import { Hono } from "hono";
import { cors } from "hono/cors";
import { channelsRouter } from "./router/channels";
import { messagesRouter } from "./router/messages";

const app = new Hono();

app.use(
  cors({
    origin: "*",
    allowMethods: ["GET"],
  })
);

app.get("/", (c) => {
  return c.json({
    message: "Hello World",
  });
});

export const routes = app
  .route("/", channelsRouter)
  .route("/messages", messagesRouter);
export type AppType = typeof routes;

Bun.serve({
  fetch: app.fetch,
  port: 3001,
});
