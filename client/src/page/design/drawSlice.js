import { createSlice } from "@reduxjs/toolkit";
import {
  IconBarcode,
  IconCircle,
  IconPhoto,
  IconQrcode,
  IconQuestionMark,
  IconSquare,
  IconTypography,
} from "@tabler/icons";
import { CONVERT_RATIO } from "../calibrate/paperSlice";

export const TYPE = {
  rect: "rect",
  circle: "circle",
  text: "text",
  image: "image",
  bar: "bar",
  qr: "qr",
};
export const GROUP = {
  DATA: "Data",
  CONST: "Constant",
};
export const DETAIL_ICON_SIZE = 14;
export const MAX_FILE_SIZE = 5 * 1024 ** 2;

export function convertSize(layout, unit) {
  return {
    ...layout,
    w: layout.w * CONVERT_RATIO[layout.unit][unit],
    h: layout.h * CONVERT_RATIO[layout.unit][unit],
    unit,
  };
}
export function typeToIcon(type) {
  return type === TYPE.rect ? (
    <IconSquare />
  ) : type === TYPE.circle ? (
    <IconCircle />
  ) : type === TYPE.text ? (
    <IconTypography />
  ) : type === TYPE.image ? (
    <IconPhoto />
  ) : type === TYPE.bar ? (
    <IconBarcode />
  ) : type === TYPE.qr ? (
    <IconQrcode />
  ) : (
    <IconQuestionMark />
  );
}
export function getLayerSize(layer, ratio) {
  if (layer.type === TYPE.text) {
    const textElement = document.getElementById(`layer-${layer.name}`);

    return {
      ...layer.size,
      w: textElement ? Math.ceil(textElement.offsetWidth / ratio) : 0,
      h: textElement ? Math.ceil(textElement.offsetHeight / ratio) : 0,
    };
  } else if (layer.type === TYPE.bar) {
    const textElement = document.getElementById(`layer-${layer.name}`);

    return {
      ...layer.size,
      w: textElement ? textElement.offsetWidth / ratio : 0,
    };
  } else if (layer.type === TYPE.qr) {
    return {
      ...layer.size,
      h: layer.size.w,
    };
  } else return layer.size;
}

/**
 * size: {w, h, unit, ratio}
 * 1 inch = 25.4 mm
 * 1 inch = 96 px
 *
 * layer: [{
 *    name: "",
 *    type: "",
 *    size: { x: 0, y: 0, w: 0, h: 0, nw, nh },
 *    font: { family: "", style: "", size:0 , weight: 0, color:{ value, format } }
 *    border: { style: "", width: 0, color: { value, format } }
 *    background: { value, format },
 *    var: { default: "", format:"", img: { [key]: [url] } } // image
 *    var: [ { value: "0.3765313557327803", label: "|", group: GROUP.CONST }, ... ] // text, bar, qr
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
        var: [{ value: "0.1234", label: "ABCD", group: GROUP.CONST }],
      },
      {
        name: "refText",
        type: "text",
        size: { x: 200, y: 51 },
        font: { size: 10, weight: 700, color: { value: "#000000" } },
        var: [{ value: "0.1234", label: "REF", group: GROUP.CONST }],
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
        var: [{ value: "0.1234", label: "10010001", group: GROUP.CONST }],
      },
      {
        name: "lotText",
        type: "text",
        size: { x: 200, y: 74 },
        font: { size: 10, weight: 700, color: { value: "#000000" } },
        var: [{ value: "0.1234", label: "LOT", group: GROUP.CONST }],
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
        var: [{ value: "0.1234", label: "Made in Korea", group: GROUP.CONST }],
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
        var: [
          { value: "0.1234", label: "Sample Sub Title", group: GROUP.CONST },
        ],
      },
      {
        name: "titleText",
        type: "text",
        size: { x: 63, y: 7 },
        font: { size: 20, weight: 700, color: { value: "#000000" } },
        var: [{ value: "0.1234", label: "Sample Title", group: GROUP.CONST }],
      },
      {
        name: "logoText",
        type: "text",
        size: { x: 18, y: 23 },
        font: { size: 9, weight: 400, color: { value: "#000000" } },
        var: [{ value: "0.1234", label: "image", group: GROUP.CONST }],
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
      if (!state.layer.length) state.selected = -1;
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
