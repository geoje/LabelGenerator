import { configureStore } from "@reduxjs/toolkit";

import count from "./page/counter/countSlice";
import step from "./page/nav/stepSlice";
import data from "./page/import/dataSlice";

export const store = configureStore({
  reducer: { count, step, data },
});
