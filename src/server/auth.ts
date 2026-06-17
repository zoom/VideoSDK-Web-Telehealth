import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { eq } from "drizzle-orm";

import { env } from "~/env";
import { capitalize } from "~/lib/utils";
import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
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

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: (user as { role?: Role | null }).role,
      },
    }),
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  events: {
    createUser: async (message) => {
      if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
        const { user } = message;
        const randomAnimal =
          animals[Math.floor(Math.random() * (animals.length - 1))];
        const randomColor =
          colors[Math.floor(Math.random() * (colors.length - 1))];
        const name = `${capitalize(randomColor)} ${capitalize(randomAnimal)}`;
        await db
          .update(users)
          .set({
            name,
            image: `https://source.boringavatars.com/marble/120/${name}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`,
          })
          .where(eq(users.id, user.id));
      }
    },
  },
  theme: {
    colorScheme: "light",
    logo: "/logo.svg",
  },
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      checks: ["none"],
    }),
  ],
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
