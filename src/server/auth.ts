import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type User as PrismaUser } from "@prisma/client";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GithubProvider from "next-auth/providers/github";
// import config from "tailwind.config";
import { env } from "~/env";
import { capitalize } from "~/lib/utils";
import { db } from "~/server/db";
import { animals, colors } from "~/utils/random";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      role?: PrismaUser['role'];
    };
  }

  interface User {
    // ...other properties
    role?: PrismaUser['role'];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
      },
    }),
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  adapter: PrismaAdapter(db),
  events: {
    createUser: async (message) => {
      if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
        const { user } = message;
        const randomAnimal = animals[Math.floor(Math.random() * (animals.length - 1))];
        const randomColor = colors[Math.floor(Math.random() * (colors.length - 1))];
        const name = `${capitalize(randomColor)} ${capitalize(randomAnimal)}`;
        await db.user.update({
          where: { id: user.id },
          data: { name: name, image: `https://source.boringavatars.com/marble/120/${name}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51` },
        });
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
      checks: ['none'],
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
