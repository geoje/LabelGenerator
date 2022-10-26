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
 *    text: { type: "", static: "", format: { ... } }
 * }, ...]
 *
 * selected: -1
 *
 * page: 1
 *
 * rename: ""
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
        var: { type: "static", static: "Sample Text" },
      },
    ],
    selected: -1,
    page: 1,
    rename: { value: "", error: "" },
  },
  reducers: {
    setSize: (state, action) => {
      state.size = action.payload;
    },
    setSizeRatio: (state, action) => {
      state.size.ratio = action.payload;
    },
    addLayer: (state, action) => {
      state.layer.push(action.payload);
    },
    changeLayerIndex: (state, action) => {
      state.layer.splice(
        action.payload.to,
        0,
        state.layer.splice(action.payload.from, 1)[0]
      );
    },
    removeLayerByIndex: (state, action) => {
      // If the last layer selected and removing
      if (state.selected === state.layer.length - 1) state.selected--;

      // Reduce layer
      state.layer.splice(action.payload, 1);
    },
    /**
     *
     * @param {*} state
     * @param {payload: {index, size:{x, y, w, h}}} action
     */
    setLayerSize: (state, action) => {
      state.layer[action.payload.index].size = action.payload.size;
    },
    /**
     *
     * @param {*} state
     * @param {payload: {index, var:{type, static|format}}}} action
     */
    setVar: (state, action) => {
      state.layer[action.payload.index].var = action.payload.var;
    },
    renameLayer: (state, action) => {
      state.layer[action.payload.index].name = action.payload.name;
    },

    setSelected: (state, action) => {
      state.selected = action.payload;
      state.rename = {
        value: state.selected === -1 ? "" : state.layer[action.payload].name,
        error: "",
      };
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setRename: (state, action) => {
      state.rename = action.payload;
    },
  },
});

export const {
  setSize,
  setSizeRatio,
  addLayer,
  changeLayerIndex,
  removeLayerByIndex,
  setLayerSize,
  setVar,
  renameLayer,
  setSelected,
  setPage,
  setRename,
} = slice.actions;
export default slice.reducer;
