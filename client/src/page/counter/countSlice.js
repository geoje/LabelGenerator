import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "count",
  initialState: { value: 0 },
  reducers: {
    up: (state, action) => {
      state.value += action.payload;
    },
    down: (state, action) => {
      state.value -= action.payload;
    },
  },
});

export const { up, down } = slice.actions;
export default slice.reducer;
