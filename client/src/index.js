import { MantineProvider } from "@mantine/core";
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import WebFont from "webfontloader";

import Nav from "./page/nav";
import Draw from "./page/draw";
import Print from "./page/print";

import "./index.css";

function App() {
  // Download Font
  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Poppins"],
      },
    });
  });

  return (
    <>
      <Nav />
      <Draw />
      <Print />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <App />
  </MantineProvider>
);
