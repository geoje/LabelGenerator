import Pageable from "pageable";
import { useEffect } from "react";
import WebFont from "webfontloader";

import "./App.css";

function App() {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Poppins"],
      },
    });

    var anchors = [].slice.call(
      document.querySelector(".anchors").firstElementChild.children
    );
    new Pageable("#container", {
      freeScroll: true, // allow manual scrolling when dragging instead of automatically moving to next page
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
            <a href="#page-1" className="active">
              Draw
            </a>
          </li>
          <li>
            <a href="#page-2">Print</a>
          </li>
        </ul>
      </div>
      <div className="pg-wrapper pg-vertical">
        <div id="container" className="pg-container">
          <div data-anchor="page-1" id="page-1" className="pg-page pg-active">
            <h1>Draw</h1>
          </div>
          <div data-anchor="page-2" id="page-2" className="pg-page">
            <h1>Print</h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
