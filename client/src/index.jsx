import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { Provider, useSelector } from "react-redux";
import { store } from "./store";

import Nav from "./page/nav/nav";
import Import from "./page/import/import";
import Design from "./page/design/design";
import Print from "./page/print/print";

function App() {
  const step = useSelector((state) => state.step.value);
  const [colorScheme, setColorScheme] = useState("light");
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  document.querySelector("body").style.backgroundColor =
    colorScheme === "dark" ? "#1A1B1E" : "#F8F9FA";

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NotificationsProvider>
          <Nav />
          {step === 0 ? <Import /> : step === 1 ? <Design /> : <Print />}
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode> If it available, DragDropContext on design doesn't work
  <Provider store={store}>
    <App />
  </Provider>
  // </React.StrictMode>
);
