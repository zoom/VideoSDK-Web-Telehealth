"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { SessionProvider } from "next-auth/react";
import { useState, type ReactNode } from "react";
import superjson from "superjson";

import ToggleRoleBanner from "~/components/ui/ToggleRole";
import { Toaster } from "~/components/ui/toaster";
import { env } from "~/env";
import { api, getBaseUrl } from "~/utils/api";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            opts.direction === "down" && opts.result instanceof Error,
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <SessionProvider>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {env.NEXT_PUBLIC_TESTMODE === "TESTING" ? <ToggleRoleBanner /> : null}
          {children}
          <Toaster />
        </QueryClientProvider>
      </api.Provider>
    </SessionProvider>
  );
}
