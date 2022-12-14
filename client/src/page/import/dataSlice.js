import { createSlice } from "@reduxjs/toolkit";

export const MAX_FILE_SIZE = 5 * 1024 ** 2;

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
