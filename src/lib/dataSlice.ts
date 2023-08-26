import { createSlice } from "@reduxjs/toolkit";
import { intls } from "..";

export const MAX_FILE_SIZE = 5 * 1024 ** 2;

/**
 * value: [ {'id': 'abc', 'pw': '123'}, ...]
 * locale: "en"
 */
const slice = createSlice({
  name: "data",
  initialState: {
    value: [],
    locale: Object.keys(intls).includes(navigator.language)
      ? navigator.language
      : "en",
  },
  reducers: {
    setData: (state, action) => {
      state.value = action.payload;
    },
    setLocale: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setData, setLocale } = slice.actions;
export default slice.reducer;
