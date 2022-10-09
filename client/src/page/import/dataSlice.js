import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "data",
  initialState: { value: null },
  reducers: {
    set: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { set } = slice.actions;
export default slice.reducer;
