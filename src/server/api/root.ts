import { createTRPCRouter } from "~/server/api/trpc";
import { sessionRouter } from "./routers/session";
import { userRouter } from "./routers/user";
import { S3Router } from "./routers/S3";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  room: sessionRouter,
  S3: S3Router
});

// export type definition of API
export type AppRouter = typeof appRouter;
