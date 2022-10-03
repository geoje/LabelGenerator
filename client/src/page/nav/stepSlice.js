import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "step",
  initialState: { value: 0 },
  reducers: {
    next: (state) => (state.value < 2 ? state.value + 1 : state.value),
    prev: (state) => (state.value > 0 ? state.value - 1 : state.value),
    set: (state, action) => (state.value = action.payload),
  },
});

export const { next, prev, set } = slice.actions;
export default slice.reducer;
