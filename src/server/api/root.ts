import { createTRPCRouter } from "~/server/api/trpc";
import { sessionRouter } from "./routers/session";
import { userRouter } from "./routers/user";
import { S3Router } from "./routers/S3";
import { zoomRouter } from "./routers/zoom";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  room: sessionRouter,
  S3: S3Router,
  zoom: zoomRouter,
});

export type AppRouter = typeof appRouter;
