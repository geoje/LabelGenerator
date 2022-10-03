import { configureStore } from "@reduxjs/toolkit";

import count from "./page/counter/countSlice";
import step from "./page/nav/stepSlice";

export const store = configureStore({
  reducer: { count, step },
});
