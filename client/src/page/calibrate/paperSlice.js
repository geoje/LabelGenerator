import { createSlice } from "@reduxjs/toolkit";

export const UNIT = { inch: "inch", mm: "mm", px: "px" };
const CONVERT_RATIO = {
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
    unit,
  };
}
export function convertGap(gap, unit) {
  return {
    l: gap.l * CONVERT_RATIO[gap.unit][unit],
    t: gap.t * CONVERT_RATIO[gap.unit][unit],
    r: gap.r * CONVERT_RATIO[gap.unit][unit],
    b: gap.b * CONVERT_RATIO[gap.unit][unit],
    unit,
  };
}

/**
 * layout: { w, h, unit },
 * gap: { l, t, r, b, unit },
 */
const slice = createSlice({
  name: "paper",
  initialState: {
    layout: { w: 4, h: 1, unit: UNIT.inch, type: PAPER_TYPE.fit },
    gap: { l: 0, t: 0, r: 0, b: 0, unit: UNIT.inch },
  },
  reducers: {
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
    setGap: (state, action) => {
      state.gap = action.payload;
    },
  },
});

export const { setLayout, setGap } = slice.actions;
export default slice.reducer;
