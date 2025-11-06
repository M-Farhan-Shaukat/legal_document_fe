import "./globals.css";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";
import { ReduxProvider } from "./reduxProvider";
import CookieManager from "./components/CookieManager";
import ErrorBoundary from "./components/ErrorBoundary";
//import PusherClient from "./utils/echo";

export const metadata = {
  title: "Law Forma",
  description: "Smart Answer Replacement for Legal Forms & Documents",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" type="image/svg+xml" />
      </Head>
      <body>
        <ErrorBoundary>
          <ReduxProvider>
            <CookieManager />
            {/*<PusherClient />*/}
            {children}
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
