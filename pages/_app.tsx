import "@/styles/globals.css";
import { ColorScheme } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { ColorSchemeProvider, MantineProvider } from "@mantine/styles";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";

export default appWithTranslation(
  ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
    const toggleColorScheme = (value?: ColorScheme) =>
      setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

    return (
      <>
        <Head>
          <title>Label Generator</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{ colorScheme }}
          >
            <NotificationsProvider>
              <Component {...pageProps} />
            </NotificationsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </>
    );
  }
);
