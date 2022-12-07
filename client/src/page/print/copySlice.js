import { createSlice } from "@reduxjs/toolkit";

export function calculatePageMap(
  data,
  paperLayoutPx,
  drawLayoutPx,
  filter,
  qtyFormat
) {
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

  const existsFilter = filter.format && filter.value;
  for (let i = 0; i < data.length; i++) {
    // Filtering
    if (existsFilter && data[i][filter.format] !== filter.value) continue;

    // Quantify
    if (qtyFormat) for (let j = data[i][qtyFormat]; j; j--) pushResult(i);
    else pushResult(i);
  }

  return result;
}

const slice = createSlice({
  name: "copy",
  initialState: {
    qtyFormat: null,
    filter: { format: null, value: null },
    exclue: {},
  },
  reducers: {
    setQtyFormat: (state, action) => {
      state.qtyFormat = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setExclude: (state, action) => {
      state.filter = action.payload;
    },
  },
});

export const { setQtyFormat, setFilter, setExclude } = slice.actions;
export default slice.reducer;
