import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { Provider, useSelector } from "react-redux";
import { store } from "./store";

import Nav from "./page/nav/nav";
import Data from "./page/data/data";
import Design from "./page/design/design";
import Print from "./page/print/print";

function App() {
  const step = useSelector((state) => state.step.value);

  return (
    <>
      <Nav />
      {step === 0 ? <Data /> : step === 1 ? <Design /> : <Print />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <NotificationsProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </NotificationsProvider>
  </MantineProvider>
);
