import { createSlice } from "@reduxjs/toolkit";

/**
 * [ {value: "ID", literal: false},
 *   {value: "|", literal: true},
 *   {value: "PW", literal: false} ]
 */
const slice = createSlice({
  name: "qrFormat",
  initialState: { value: null },
  reducers: {
    set: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { set } = slice.actions;
export default slice.reducer;
