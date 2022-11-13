import { createSlice } from "@reduxjs/toolkit";

export const UNIT = { inch: "inch", mm: "mm", px: "px" };
export const CONVERT_RATIO = {
  inch: {
    inch: 1,
    mm: 25.4,
    px: 96,
  },
  mm: {
    inch: 1 / 25.4,
    mm: 1,
    px: 96 / 25.4,
  },
  px: {
    inch: 1 / 96,
    mm: 25.4 / 96,
    px: 1,
  },
};
export const PAPER_TYPE = {
  fit: "fit",
  letter: "letter",
  a4: "a4",
  custom: "custom",
};
export const DEFAULT_PAPER_SIZE = {
  letter: { w: 8.5, h: 11, unit: UNIT.inch },
  a4: { w: 210, h: 296, unit: UNIT.mm },
};

export function convertSize(layout, unit) {
  return {
    ...layout,
    w: layout.w * CONVERT_RATIO[layout.unit][unit],
    h: layout.h * CONVERT_RATIO[layout.unit][unit],
    l: layout.l * CONVERT_RATIO[layout.unit][unit],
    t: layout.t * CONVERT_RATIO[layout.unit][unit],
    r: layout.r * CONVERT_RATIO[layout.unit][unit],
    b: layout.b * CONVERT_RATIO[layout.unit][unit],
    unit,
  };
}

/**
 * layout: { w, h, l, t, r, b, unit, type },
 */
const slice = createSlice({
  name: "paper",
  initialState: {
    layout: {
      w: 4,
      h: 1,
      l: 0,
      t: 0,
      r: 0.1,
      b: 0.1,
      unit: UNIT.inch,
      type: PAPER_TYPE.fit,
    },
  },
  reducers: {
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
  },
});

export const { setLayout } = slice.actions;
export default slice.reducer;
