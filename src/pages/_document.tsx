import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html>
      <Head />
      <body className="overflow-x-hidden">
        <Main />
        <NextScript />
        <Script src="/coi-serviceworker.js" strategy="beforeInteractive" />
      </body>
    </Html>
  );
}
