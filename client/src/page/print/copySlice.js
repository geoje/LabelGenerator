import { createSlice } from "@reduxjs/toolkit";

export function qtyPerPaper(paperLayoutPx, drawLayoutPx) {
  return (
    Math.floor(
      1 +
        (paperLayoutPx.w - paperLayoutPx.l - drawLayoutPx.w) /
          (drawLayoutPx.w + paperLayoutPx.r)
    ) *
    Math.floor(
      1 +
        (paperLayoutPx.h - paperLayoutPx.t - drawLayoutPx.h) /
          (drawLayoutPx.h + paperLayoutPx.b)
    )
  );
}
export function calculatePageMap(
  data,
  paperLayoutPx,
  drawLayoutPx,
  condition,
  exclude
) {
  let result = [[]];

  // If exclude return -1, else return 0
  const pushResult = (index) => {
    let lastI = result.length - 1,
      lastJ = result[lastI].length - 1;
    if (result[lastI].length < qtyPerPaper(paperLayoutPx, drawLayoutPx))
      result[lastI].push(index);
    else result.push([index]);

    // Check exclude
    lastI = result.length - 1;
    lastJ = result[lastI].length - 1;
    if (exclude[lastI] && exclude[lastI][lastJ])
      return (result[lastI][lastJ] = -1);
    else return 0;
  };

  const existsFilter = condition.filterFormat && condition.filterValue;
  for (let i = 0; i < data.length; i++) {
    // Blank space
    if (exclude)
      if (
        existsFilter &&
        data[i][condition.filterFormat] !== condition.filterValue
      )
        // Filtering
        continue;

    // Quantify
    if (condition.qtyFormat)
      for (let j = data[i][condition.qtyFormat]; j; j--) j -= pushResult(i);
    else i += pushResult(i);
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
    // action.payload: [1d-idx, 2d-idx]
    addExclude: (state, action) => {
      let temp = JSON.parse(JSON.stringify(state.exclude));
      if (!temp[action.payload[0]]) temp[action.payload[0]] = {};
      temp[action.payload[0]][action.payload[1]] = true;
      state.exclude = temp;
    },
    // action.payload: [1d-idx, 2d-idx]
    delExclude: (state, action) => {
      let temp = JSON.parse(JSON.stringify(state.exclude));
      if (!temp[action.payload[0]]) temp[action.payload[0]] = {};
      delete temp[action.payload[0]][action.payload[1]];
      if (!Object.keys(temp[action.payload[0]]).length)
        delete temp[action.payload[0]];
      state.exclude = temp;
    },
  },
});

export const { setCondition, setExclude, addExclude, delExclude } =
  slice.actions;
export default slice.reducer;
