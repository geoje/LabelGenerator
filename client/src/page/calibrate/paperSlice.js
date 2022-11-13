import { createSlice } from "@reduxjs/toolkit";

export const UNIT = { inch: "inch", mm: "mm", px: "px" };
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
  initialState: { size: { w: 4, h: 1, unit: UNIT.inch }, offset: {} },
  reducers: {
    setPaperSize: (state, action) => {
      state.size = action.payload;
    },
  },
});

export const { setPaperSize } = slice.actions;
export default slice.reducer;
