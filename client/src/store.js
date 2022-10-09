import { configureStore } from "@reduxjs/toolkit";

import step from "./page/nav/stepSlice";
import data from "./page/import/dataSlice";
import qrFormat from "./page/import/qrFormatSlice";

export const store = configureStore({
  reducer: { step, data, qrFormat },
});
