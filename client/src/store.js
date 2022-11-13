import { configureStore } from "@reduxjs/toolkit";

import step from "./page/nav/stepSlice";
import data from "./page/import/dataSlice";
import draw from "./page/design/drawSlice";
import paper from "./page/calibrate/paperSlice";
import copy from "./page/print/copySlice";

export const store = configureStore({
  reducer: { step, data, draw, paper, copy },
});
