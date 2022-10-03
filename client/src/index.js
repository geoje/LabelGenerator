import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";

import { Provider } from "react-redux";
import { store } from "./store";

import Nav from "./page/nav/nav";
import Design from "./page/design/design";
import Print from "./page/print/print";

ReactDOM.createRoot(document.getElementById("root")).render(
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <Provider store={store}>
      <Nav />
      <Design />
      <Print />
    </Provider>
  </MantineProvider>
);
