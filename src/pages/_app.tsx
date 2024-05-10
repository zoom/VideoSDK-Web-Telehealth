import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { Inter } from "next/font/google";
import RouteValidator from "~/components/RouteValidator";
import { Toaster } from "~/components/ui/toaster";
import Head from "next/head";
import ToggleRoleBanner from "~/components/ui/ToggleRole";
import { env } from "~/env";

const inter = Inter({ subsets: ["latin"] });

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SessionProvider session={session}>
        <RouteValidator>
          <div className={inter.className}>
            {env.NEXT_PUBLIC_TESTMODE === "TESTING" ? <ToggleRoleBanner /> : <></>}
            <Component {...pageProps} />
          </div>
        </RouteValidator>
        <Toaster />
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
