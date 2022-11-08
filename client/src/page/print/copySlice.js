import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "copy",
  initialState: { format: null },
  reducers: {
    setFormat: (state, action) => {
      state.format = action.payload;
    },
  },
});

export const { setFormat } = slice.actions;
export default slice.reducer;
