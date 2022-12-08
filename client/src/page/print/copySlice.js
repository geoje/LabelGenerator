import { createSlice } from "@reduxjs/toolkit";

export function calculatePageMap(data, paperLayoutPx, drawLayoutPx, condition) {
  let result = [[]];
  const qtyPerPaper =
    Math.floor(
      1 +
        (paperLayoutPx.w - paperLayoutPx.l - drawLayoutPx.w) /
          (drawLayoutPx.w + paperLayoutPx.r)
    ) *
    Math.floor(
      1 +
        (paperLayoutPx.h - paperLayoutPx.t - drawLayoutPx.h) /
          (drawLayoutPx.h + paperLayoutPx.b)
    );

  const pushResult = (index) => {
    if (result[result.length - 1].length < qtyPerPaper)
      result[result.length - 1].push(index);
    else result.push([index]);
  };

  const existsFilter = condition.filterFormat && condition.filterValue;
  for (let i = 0; i < data.length; i++) {
    // Filtering
    if (
      existsFilter &&
      data[i][condition.filterFormat] !== condition.filterValue
    )
      continue;

    // Quantify
    if (condition.qtyFormat)
      for (let j = data[i][condition.qtyFormat]; j; j--) pushResult(i);
    else pushResult(i);
  }

  return result;
}

const slice = createSlice({
  name: "copy",
  initialState: {
    condition: { filterFormat: null, filterValue: null, copiesFormat: null },
    exclude: {},
  },
  reducers: {
    setCondition: (state, action) => {
      state.condition = action.payload;
    },
    setExclude: (state, action) => {
      state.exclude = action.payload;
    },
  },
});

export const { setCondition, setExclude } = slice.actions;
export default slice.reducer;
