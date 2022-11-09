import { createSlice } from "@reduxjs/toolkit";

/**
 * size: {w, h, unit, ratio}
 * 1 inch = 2.54 cm
 * 1 inch = 96 px (for pdf is 72px)
 *
 * layer: [{
 *    name: "",
 *    type: "",
 *    size: { x: 0, y: 0, w: 0, h: 0, nw, nh },
 *    font: { family: "", style: "", size:0 , weight: 0, color:{ value, format } }
 *    border: { style: "", width: 0, color: { value, format } }
 *    background: { value, format },
 *    var: { type: "", static: "", format: "" } // text
 *    var: { default: "", format:"", img: { [key]: [url] } } // image
 * }, ...]
 *
 * selected: -1
 *
 * page: 0
 *
 * rename: { value, error }
 */
const slice = createSlice({
  name: "draw",
  initialState: {
    layout: {
      w: 4,
      h: 1,
      unit: "inch",
      ratio: 1,
    },
    layer: [
      { name: "qr", type: "qr", size: { x: 296, y: 8, w: 80 } },
      {
        name: "refVar",
        type: "text",
        size: { x: 227, y: 51 },
        font: { size: 10, weight: 400, color: { value: "#000000" } },
        var: { type: "static", static: "ABCD" },
      },
      {
        name: "refText",
        type: "text",
        size: { x: 200, y: 51 },
        font: { size: 10, weight: 700, color: { value: "#000000" } },
        var: { type: "static", static: "REF" },
      },
      {
        name: "refRect",
        type: "rect",
        size: { x: 196, y: 50, w: 26, h: 18 },
        border: { style: "solid", width: 1, color: { value: "#000000" } },
      },
      {
        name: "lotVar",
        type: "text",
        size: { x: 227, y: 74 },
        font: { size: 10, weight: 400, color: { value: "#000000" } },
        var: { type: "static", static: "10010001" },
      },
      {
        name: "lotText",
        type: "text",
        size: { x: 200, y: 74 },
        font: { size: 10, weight: 700, color: { value: "#000000" } },
        var: { type: "static", static: "LOT" },
      },
      {
        name: "lotRect",
        type: "rect",
        size: { x: 196, y: 73, w: 26, h: 18 },
        border: { style: "solid", width: 1, color: { value: "#000000" } },
      },
      {
        name: "madeText",
        type: "text",
        size: { x: 9, y: 76 },
        font: { size: 8, weight: 400, color: { value: "#000000" } },
        var: { type: "static", static: "Made in Korea" },
      },
      {
        name: "titleLine",
        type: "rect",
        size: { x: 60, y: 39, w: 220, h: 2 },
        border: {},
        background: { color: { value: "#000000" } },
      },
      {
        name: "titleTextSub",
        type: "text",
        size: { x: 186, y: 20 },
        font: { size: 10, weight: 400, color: { value: "#000000" } },
        var: { type: "static", static: "Sample Sub Title" },
      },
      {
        name: "titleText",
        type: "text",
        size: { x: 63, y: 7 },
        font: { size: 20, weight: 700, color: { value: "#000000" } },
        var: { type: "static", static: "Sample Title" },
      },
      {
        name: "logoText",
        type: "text",
        size: { x: 18, y: 23 },
        font: { size: 9, weight: 400, color: { value: "#000000" } },
        var: { type: "static", static: "image" },
      },
      {
        name: "logoImage",
        type: "rect",
        size: { x: 10, y: 10, w: 40, h: 40 },
        border: {},
        background: {
          color: { value: "rgba(0, 0, 0, 0.1)", format: "rgba" },
        },
      },
    ],
    selected: -1,
    page: 0,
    rename: { value: "", error: "" },
  },
  reducers: {
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
    setLayoutRatio: (state, action) => {
      state.layout.ratio = action.payload;
    },

    setLayer: (state, action) => {
      state.layer = action.payload;
    },
    addLayer: (state, action) => {
      state.layer.unshift(action.payload);
      state.selected = 0;
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
    setLayerFont: (state, action) => {
      state.layer[action.payload.index].font = action.payload.font;
    },
    setLayerBorder: (state, action) => {
      state.layer[action.payload.index].border = action.payload.border;
    },

    /**
     *
     * @param {*} state
     * @param {payload: {index, color:{value, format}}} action
     */
    setLayerBorderColor: (state, action) => {
      state.layer[action.payload.index].border = {
        ...state.layer[action.payload.index].border,
        color: action.payload.color,
      };
    },
    setLayerBackColor: (state, action) => {
      state.layer[action.payload.index].background = {
        ...state.layer[action.payload.index].background,
        color: action.payload.color,
      };
    },
    setLayerFontColor: (state, action) => {
      state.layer[action.payload.index].font = {
        ...state.layer[action.payload.index].font,
        color: action.payload.color,
      };
    },
    setLayerVar: (state, action) => {
      state.layer[action.payload.index].var = action.payload.var;
    },
    setLayerVarImg: (state, action) => {
      state.layer[action.payload.index].var.img = action.payload.img;
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
  setLayout,
  setLayoutRatio,
  setLayer,
  addLayer,
  changeLayerIndex,
  removeLayerByIndex,
  setLayerSize,
  setLayerFont,
  setLayerBorder,
  setLayerBorderColor,
  setLayerBackColor,
  setLayerFontColor,
  setLayerVar,
  setLayerVarImg,
  renameLayer,
  setSelected,
  setPage,
  setRename,
} = slice.actions;
export default slice.reducer;
