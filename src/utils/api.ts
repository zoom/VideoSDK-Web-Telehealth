import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { createTRPCReact } from "@trpc/react-query";

import { type AppRouter } from "~/server/api/root";

export const api = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
