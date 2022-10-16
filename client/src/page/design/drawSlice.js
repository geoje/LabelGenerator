import { createSlice } from "@reduxjs/toolkit";

/**
 * size: {w, h, unit, ratio}
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
      ratio: 1,
    },
    layer: [
      {
        name: "MyRect",
        type: "rect",
      },
      {
        name: "YourCircle",
        type: "circle",
      },
      {
        name: "OurTypo",
        type: "typo",
      },
    ],
  },
  reducers: {
    setSize: (state, action) => {
      state.size = action.payload;
    },
    setSizeRatio: (state, action) => {
      state.size.ratio = action.payload;
    },
    setLayer: (state, action) => {
      state.layer = action.payload;
    },
  },
});

export const { setSize, setSizeRatio, setLayer } = slice.actions;
export default slice.reducer;
