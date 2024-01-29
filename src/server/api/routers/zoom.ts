import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { generateSignature } from "~/utils/signJwt";

export const zoomRouter = createTRPCRouter({
  // createJWT: protectedProcedure
  //   .input(
  //     z.object({
  //       sessionName: z.string(),
  //       role: z.number(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     return generateSignature(
  //       input.sessionName,
  //       input.role,
  //     )
  //   }),
});

