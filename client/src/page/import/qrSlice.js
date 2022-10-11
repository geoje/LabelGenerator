import { createSlice } from "@reduxjs/toolkit";

/**
 * foramt: [ {value: "ID", literal: false},
 *   {value: "|", literal: true},
 *   {value: "PW", literal: false} ]
 * 
 * custom: [
 *   { value: "0.12345678901", label: "|", group: GRP_CUST },
 *   { value: "0.23456789012", label: ",", group: GRP_CUST },
  ]

  seletec: [ 'Item Code', '0.04011438054991201', 'GTIN', '0.5414428830363092', 'Item Name' ]
 */
// const GRP_DATA = "Data Header";
const GRP_CUST = "Custom Created";

const slice = createSlice({
  name: "qr",
  initialState: {
    format: [],
    custom: [
      { value: Math.random().toString(), label: "|", group: GRP_CUST },
      { value: Math.random().toString(), label: ",", group: GRP_CUST },
    ],
    selected: [],
  },
  reducers: {
    setFormat: (state, action) => {
      state.format = action.payload;
    },
    setCustom: (state, action) => {
      state.custom = action.payload;
    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { setFormat, setCustom, setSelected } = slice.actions;
export default slice.reducer;
