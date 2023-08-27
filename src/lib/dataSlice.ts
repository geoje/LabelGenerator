import { createSlice } from "@reduxjs/toolkit";
import enMsg from "../lang/en.json";
import koMsg from "../lang/ko.json";

export const MAX_FILE_SIZE = 5 * 1024 ** 2;
export const intls: {
  [index: string]: {
    flag: string;
    lang: string;
    message: { [index: string]: string };
  };
} = {
  en: { flag: "US", lang: "English", message: enMsg },
  ko: { flag: "KR", lang: "한국어", message: koMsg },
};

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
