import { createSlice } from "@reduxjs/toolkit";

/**
 * size: {w, h, unit, ratio}
 * 1 inch = 2.54 cm
 * 1 inch = 96 px
 *
 * layer: [{
 *    name: "",
 *    type: "",
 *    size: { x: 0, y: 0, w: 0, h: 0 },
 *    font: { family:"", size:0, color:"" }
 *    border: { style: "", width: 0, color: "" }
 *    backgroundColor: "",
 *    var: { default: "", ... }
 * }, ...]
 *
 * selected: { hold: false, index: -1, ox: 0, oy: 0 }
 */
const slice = createSlice({
  name: "draw",
  initialState: {
    size: {
      w: 3.74,
      h: 0.79,
      unit: "inch",
      ratio: 1,
    },
    layer: [
      {
        name: "MyRect",
        type: "rect",
        size: {
          x: 10,
          y: 10,
          w: 20,
          h: 10,
        },
        border: {
          style: "solid",
          width: 1,
          color: "#00ff00",
        },
      },
      {
        name: "YourCircle",
        type: "circle",
        size: {
          x: 40,
          y: 20,
          w: 20,
          h: 20,
        },
        backgroundColor: "#ff0000",
      },
      {
        name: "OurText",
        type: "text",
        size: {
          x: 80,
          y: 10,
        },
        font: { size: 10, color: "#0000ff" },
        var: { default: "Sample Text" },
      },
    ],
    selected: { hold: false, index: -1, ox: 0, oy: 0 },
  },
  reducers: {
    setSize: (state, action) => {
      state.size = action.payload;
    },
    setSizeRatio: (state, action) => {
      state.size.ratio = action.payload;
    },
    setLayer: (state, action) => {
      state.layer = action.payload;
    },
    /**
     *
     * @param {*} state
     * @param {payload: {index, size:{x, y, w, h}}} action
     */
    setLayerSize: (state, action) => {
      state.layer[action.payload.index].size = action.payload.size;
    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { setSize, setSizeRatio, setLayer, setLayerSize, setSelected } =
  slice.actions;
export default slice.reducer;
