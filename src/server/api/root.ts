import { roomRouter } from "~/server/api/routers/room";
import { createTRPCRouter } from "~/server/api/trpc";
import { zoomRouter } from "./routers/zoom";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  room: roomRouter,
  zoom: zoomRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
