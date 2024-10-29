import type { AppType } from "@reactify/api/src/index";
import { hc } from "hono/client";

export const api = hc<AppType>("http://localhost:3001", {
  headers: {
    Authorization: process.env.AUTH_TOKEN!,
  },
});
