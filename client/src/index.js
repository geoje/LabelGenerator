import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import WebFont from "webfontloader";
import Pageable from "pageable";

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

    // Set Pageable
    var anchors = [].slice.call(
      document.querySelector(".anchors").firstElementChild.children
    );
    new Pageable("#container", {
      freeScroll: true,
      onInit: (data) =>
        anchors.forEach((anchor, i) =>
          anchor.firstElementChild.classList.toggle("active", i === data.index)
        ),
      onFinish: (data) =>
        anchors.forEach((anchor, i) =>
          anchor.firstElementChild.classList.toggle("active", i === data.index)
        ),
    });
  });

  return (
    <>
      <div className="anchors">
        <ul>
          <li>
            <a href="#page-1">Draw</a>
          </li>
          <li>
            <a href="#page-2">Print</a>
          </li>
        </ul>
      </div>
      <div className="pg-wrapper pg-vertical">
        <div id="container" className="pg-container">
          <Draw />
          <Print />
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
