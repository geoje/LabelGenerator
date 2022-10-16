import { createSlice } from "@reduxjs/toolkit";

/**
 * size: {w, h, unit}
 * 1 inch = 2.54 cm
 * 1 inch = 96 px
 */
const slice = createSlice({
  name: "draw",
  initialState: {
    size: {
      w: 3.74,
      h: 0.79,
      unit: "inch",
    },
    shape: [],
  },
  reducers: {
    setSize: (state, action) => {
      state.size = action.payload;
    },
    addShape: (state, action) => {
      state.shape.push(action.payload);
    },
  },
});

export const { setSize, addShape } = slice.actions;
export default slice.reducer;
