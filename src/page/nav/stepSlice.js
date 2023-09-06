import { createSlice } from "@reduxjs/toolkit";

export const MAX_NAV = 3;

const slice = createSlice({
  name: "step",
  initialState: { value: 0 },
  reducers: {
    next: (state) => {
      if (state.value < MAX_NAV) state.value++;
    },
    prev: (state) => {
      if (state.value > 0) state.value--;
    },
    set: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { next, prev, set } = slice.actions;
export default slice.reducer;
