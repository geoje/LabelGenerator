import { configureStore } from "@reduxjs/toolkit";

import data from "./dataSlice";
import draw from "./drawSlice";
import paper from "./paperSlice";
import print from "./printSlice";

export const store = configureStore({
  reducer: { data, draw, paper, print },
});
