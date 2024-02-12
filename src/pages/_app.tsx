import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { Inter } from "next/font/google";
import RouteValidator from "~/components/RouteValidator";
import { Toaster } from "~/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <RouteValidator>
        <div className={inter.className}>
          <Component {...pageProps} />
        </div>
        <Toaster />
      </RouteValidator>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
