import { createSlice } from "@reduxjs/toolkit";

/**
 * [ {'id': 'abc', 'pw': '123'}, ...]
 */
const slice = createSlice({
  name: "data",
  initialState: { value: [] },
  reducers: {
    set: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { set } = slice.actions;
export default slice.reducer;
