import "@/styles/globals.css";
import { ColorScheme } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { ColorSchemeProvider, MantineProvider } from "@mantine/styles";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";

export default appWithTranslation(
  ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
    const toggleColorScheme = (value?: ColorScheme) =>
      setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
    useEffect(() => {
      document.body.style.background =
        colorScheme === "dark" ? "#1a1b1e" : "#f8f9fa";
    }, [colorScheme]);

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
            theme={{
              colorScheme,
              fontFamily: `Poppins,"Noto Sans KR"`,
              headings: { fontFamily: `Poppins,"Noto Sans KR"` },
            }}
          >
            <NotificationsProvider>
              <Provider store={store}>
                <Component {...pageProps} />
              </Provider>
            </NotificationsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </>
    );
  }
);
