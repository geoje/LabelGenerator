import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "copy",
  initialState: { qtyFormat: null, filter: { format: null, value: null } },
  reducers: {
    setQtyFormat: (state, action) => {
      state.qtyFormat = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
});

export const { setQtyFormat, setFilter } = slice.actions;
export default slice.reducer;
