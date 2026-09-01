import { type ReactNode } from "react";

import "~/styles/globals.css";

import { Providers } from "./providers";

export const metadata = {
  title: "Zoom Telehealth Demo",
  icons: { icon: "/favicon.svg" },
};

export const viewport = { width: "device-width", initialScale: 1 };

// ponytail: every page is client-driven (auth + tRPC); no SSG payoff to fight for
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
