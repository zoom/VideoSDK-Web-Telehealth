import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";

import { env } from "~/env";
import { capitalize } from "~/lib/utils";
import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  type Role,
} from "~/server/db/schema";
import { animals, colors } from "~/utils/random";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role?: Role | null;
    };
  }
  interface User {
    role?: Role | null;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role?: Role | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  // trust the request host on known-good infra + dev; opt in elsewhere via AUTH_TRUST_HOST
  trustHost:
    env.NODE_ENV !== "production" ||
    !!process.env.VERCEL ||
    env.AUTH_TRUST_HOST === "true",
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
      },
    }),
    redirect: ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (env.NEXT_PUBLIC_TESTMODE !== "TESTING" || !user.id) return;
      const randomAnimal = animals[Math.floor(Math.random() * (animals.length - 1))];
      const randomColor = colors[Math.floor(Math.random() * (colors.length - 1))];
      const name = `${capitalize(randomColor)} ${capitalize(randomAnimal)}`;
      await db
        .update(users)
        .set({
          name,
          image: `https://source.boringavatars.com/marble/120/${name}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`,
        })
        .where(eq(users.id, user.id));
    },
  },
  theme: { colorScheme: "light", logo: "/logo.svg" },
});
