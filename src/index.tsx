import "./index.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { HeaderSimple } from "./components/header";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Import from "./import";
import Draw from "./draw";
import Paper from "./paper";
import Print from "./print";
import { Notifications } from "@mantine/notifications";
import { Provider } from "react-redux";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { IntlProvider } from "react-intl";
import { store } from "./lib/store";
import enMsg from "./lang/en.json";
import koMsg from "./lang/ko.json";
import { useSelector } from "react-redux";

export const intls: {
  [index: string]: {
    flag: string;
    lang: string;
    message: { [index: string]: string };
  };
} = {
  en: { flag: "US", lang: "English", message: enMsg },
  ko: { flag: "KR", lang: "한국어", message: koMsg },
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
function App() {
  const { pathname } = useLocation();
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  const locale: string = useSelector((state: any) => state.data.locale);

  useEffect(() => {
    document.body.style.background =
      colorScheme === "dark" ? "#1a1b1e" : "#f8f9fa";
    document.title =
      { "/": "Import", "/draw": "Draw", "/paper": "Paper", "/print": "Print" }[
        pathname
      ] + " - Label Generator";
  }, [colorScheme, pathname]);

  return (
    <>
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
          <Provider store={store}>
            <IntlProvider locale={locale} messages={intls[locale].message}>
              <Notifications />
              <HeaderSimple />
              <Routes>
                <Route path="/" element={<Import />} />
                {/* <Route path="/draw" element={<Draw />} />
                <Route path="/paper" element={<Paper />} />
                <Route path="/print" element={<Print />} /> */}
              </Routes>
            </IntlProvider>
          </Provider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
