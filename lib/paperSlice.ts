import { createSlice } from "@reduxjs/toolkit";

export const UNIT = { inch: "inch", mm: "mm", px: "px" };
export const MAX_PRECISION = 4;
export const STEP_BY_UNIT: any = { inch: 0.0625, mm: 1, px: 1 };
export const ADJ_TOOL_SIZE = 21;

export const CONVERT_RATIO: any = {
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
export const DEFAULT_PAPER_SIZE: any = {
  letter: { w: 8.5, h: 11, unit: UNIT.inch },
  a4: { w: 210, h: 296, unit: UNIT.mm },
};

export const containerHeight = () => window.innerHeight - 140;
export function convertSize(layout: any, unit: any) {
  let result = { ...layout, unit };
  ["w", "h", "l", "t", "r", "b"].forEach(
    (k) => (result[k] = result[k] * CONVERT_RATIO[layout.unit][unit])
  );

  ["w", "h", "l", "t", "r", "b"]
    .filter((k) => String(result[k]).match(/\.\d+(0{6}|9{6})/g))
    .forEach((k) => (result[k] = Math.round(result[k] * 10000) / 10000));

  return result;
}
export function getPrecisionCount(num: any) {
  const strNum = String(num);
  const idx = strNum.indexOf(".");
  return idx === -1 ? 0 : strNum.length - idx - 1;
}

/**
 * layout: { w, h, l, t, r, b, unit, ratio, type },
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
      ratio: 1,
      type: PAPER_TYPE.fit,
    },
  },
  reducers: {
    setLayout: (state, action) => {
      state.layout = action.payload;

      const con = {
        w: Math.floor(((window.innerWidth - 30) / 6) * 5 - 20),
        h: containerHeight(),
      };
      const pap = convertSize(state.layout, UNIT.px);
      state.layout.ratio =
        pap.w < con.w && pap.h < con.h
          ? 1
          : con.w / pap.w < con.h / pap.h
          ? con.w / pap.w
          : con.h / pap.h;
    },
  },
});

export const { setLayout } = slice.actions;
export default slice.reducer;
