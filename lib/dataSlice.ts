import { createSlice } from "@reduxjs/toolkit";

export const MAX_FILE_SIZE = 5 * 1024 ** 2;

/**
 * [ {'id': 'abc', 'pw': '123'}, ...]
 */
const slice = createSlice({
  name: "data",
  initialState: { value: [] },
  reducers: {
    setData: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setData } = slice.actions;
export default slice.reducer;
