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
export const DEFAULT_PAPER_SIZE = {
  letter: { w: 8.5, h: 11, unit: UNIT.inch },
  a4: { w: 210, h: 296, unit: UNIT.mm },
};

export function convertSize(layout, unit) {
  if (unit === UNIT.inch) {
    if (layout.unit === UNIT.mm)
      return {
        w: layout.w / 25.4,
        h: layout.h / 25.4,
        unit: UNIT.inch,
        ratio: layout.ratio,
      };
    else if (layout.unit === UNIT.px)
      return {
        w: layout.w / 96,
        h: layout.h / 96,
        unit: UNIT.inch,
        ratio: layout.ratio,
      };
  } else if (unit === UNIT.mm) {
    if (layout.unit === UNIT.inch)
      return {
        w: layout.w * 25.4,
        h: layout.h * 25.4,
        unit: UNIT.mm,
        ratio: layout.ratio,
      };
    else if (layout.unit === UNIT.px)
      return {
        w: (layout.w / 96) * 25.4,
        h: (layout.h / 96) * 25.4,
        unit: UNIT.mm,
        ratio: layout.ratio,
      };
  } else if (unit === UNIT.px) {
    if (layout.unit === UNIT.inch)
      return {
        w: Math.round(layout.w * 96),
        h: Math.round(layout.h * 96),
        unit: UNIT.px,
        ratio: layout.ratio,
      };
    else if (layout.unit === UNIT.mm)
      return {
        w: Math.round((layout.w / 25.4) * 96),
        h: Math.round((layout.h / 25.4) * 96),
        unit: UNIT.px,
        ratio: layout.ratio,
      };
  }
  return layout;
}

const slice = createSlice({
  name: "paper",
  initialState: {
    layout: { w: 4, h: 1, unit: UNIT.inch },
    gap: { l: 0.1, t: 0.1, r: 0.1, b: 0.1, unit: UNIT.inch },
  },
  reducers: {
    setPaperSize: (state, action) => {
      state.layout = action.payload;
    },
    setGap: (state, action) => {
      state.gap = action.payload;
    },
  },
});

export const { setPaperSize, setGap } = slice.actions;
export default slice.reducer;
