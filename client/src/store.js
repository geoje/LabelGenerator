import { configureStore } from "@reduxjs/toolkit";

import step from "./page/nav/stepSlice";
import data from "./page/import/dataSlice";
import qr from "./page/import/qrSlice";
import draw from "./page/design/drawSlice";

export const store = configureStore({
  reducer: { step, data, qr, draw },
});
