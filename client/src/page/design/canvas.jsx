import { Paper, Text, Image as ManImage } from "@mantine/core";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import {
  TYPE,
  GROUP,
  convertLayout,
  removeLayerByIndex,
  setLayerSize,
  setSelected,
} from "./drawSlice";

export function Canvas() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);
  const page = useSelector((state) => state.draw.page);
  const layoutPx = convertLayout.px(useSelector((state) => state.draw.layout));
  const layer = useSelector((state) => state.draw.layer);
  let selected = useSelector((state) => state.draw.selected);

  const refCanvas = useRef();
  const refLayer = useRef({ current: [] });
  let [move, setMove] = useState({ x: -1, y: -1, ox: 0, oy: 0, sx: 0, sy: 0 });

  const selectedLayerSize = () => {
    if (layer[selected].type === TYPE.text) {
      const textElement = document.getElementById(
        `layer-${layer[selected].name}`
      );

      let fontScale =
        layer[selected].font?.size * layoutPx.ratio < 10
          ? layer[selected].font?.size / 10
          : 1 / layoutPx.ratio;

      return {
        ...layer[selected].size,
        w: textElement ? Math.ceil(textElement.offsetWidth * fontScale) : 0,
        h: textElement ? Math.ceil(textElement.offsetHeight * fontScale) : 0,
      };
    } else if (layer[selected].type === TYPE.bar) {
      const textElement = document.getElementById(
        `layer-${layer[selected].name}`
      );

      return {
        ...layer[selected].size,
        w: textElement ? textElement.offsetWidth / layoutPx.ratio : 0,
      };
    } else if (layer[selected].type === TYPE.qr) {
      return {
        ...layer[selected].size,
        h: layer[selected].size.w,
      };
    } else return layer[selected].size;
  };

  const onMouseMove = (event) => {
    event.preventDefault();

    const vertical =
      Math.abs(event.pageX - move.sx) < Math.abs(event.pageY - move.sy);

    setMove(
      (move = {
        ...move,
        x: Math.round(
          Math.max(
            0,
            Math.min(
              (layoutPx.w - selectedLayerSize().w) * layoutPx.ratio,
              (vertical && event.shiftKey ? move.sx : event.pageX) -
                refCanvas.current.offsetLeft -
                move.ox
            )
          ) / layoutPx.ratio
        ),
        y: Math.round(
          Math.max(
            0,
            Math.min(
              (layoutPx.h - selectedLayerSize().h) * layoutPx.ratio,
              (!vertical && event.shiftKey ? move.sy : event.pageY) -
                refCanvas.current.offsetTop -
                move.oy
            )
          ) / layoutPx.ratio
        ),
      })
    );
  };
  const onMouseDown = (event, index) => {
    event.preventDefault();
    event.stopPropagation();

    const l = layer[index];
    dispatch(setSelected((selected = index)));
    setMove(
      (move = {
        x: l.size.x,
        y: l.size.y,
        ox:
          event.nativeEvent.offsetX *
            (l.type === TYPE.text && l.font?.size * layoutPx.ratio < 10
              ? (l.font?.size * layoutPx.ratio) / 10
              : 1) +
          1,
        oy:
          event.nativeEvent.offsetY *
            (l.type === TYPE.text && l.font?.size * layoutPx.ratio < 10
              ? (l.font?.size * layoutPx.ratio) / 10
              : 1) +
          1,
        sx: event.pageX,
        sy: event.pageY,
      })
    );

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  const onMouseUp = (event) => {
    event.preventDefault();

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    if (move.x !== layer[selected].size.x || move.y !== layer[selected].size.y)
      dispatch(
        setLayerSize({
          index: selected,
          size: {
            ...layer[selected].size,
            x: move.x,
            y: move.y,
          },
        })
      );
    setMove({ x: -1, y: -1, ox: 0, oy: 0 });
  };

  useEffect(() => {
    // I don't like this duplicated code
    const selectedLayerSizee = () => {
      if (layer[selected].type === TYPE.text) {
        const textElement = document.getElementById(
          `layer-${layer[selected].name}`
        );
        return {
          ...layer[selected].size,
          w: textElement
            ? Math.ceil(textElement.offsetWidth / layoutPx.ratio)
            : 0,
          h: textElement
            ? Math.ceil(textElement.offsetHeight / layoutPx.ratio)
            : 0,
        };
      } else if (layer[selected].type === TYPE.qr) {
        return {
          ...layer[selected].size,
          h: layer[selected].size.w,
        };
      } else return layer[selected].size;
    };

    const onKeyDown = (event) => {
      if (selected === -1) return;

      if (event.key === "Delete") {
        dispatch(removeLayerByIndex(selected));
        return;
      }

      const l = layer[selected];
      let d = {
        x: (event.key === "ArrowRight") - (event.key === "ArrowLeft"),
        y: (event.key === "ArrowDown") - (event.key === "ArrowUp"),
      };
      if (d.x === 0 && d.y === 0) return;

      dispatch(
        setLayerSize({
          index: selected,
          size: {
            ...l.size,
            x: Math.max(
              0,
              Math.min(layoutPx.w - selectedLayerSizee().w, l.size.x + d.x)
            ),
            y: Math.max(
              0,
              Math.min(layoutPx.h - selectedLayerSizee().h, l.size.y + d.y)
            ),
          },
        })
      );
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch, layoutPx, layer, selected]);

  const items = layer.map((_, i) => {
    const index = layer.length - 1 - i;
    const item = layer[index];

    let defaultStyle = {
      position: "absolute",
      left: item.size.x * layoutPx.ratio,
      top: item.size.y * layoutPx.ratio,

      borderStyle: item.border?.style,
      borderWidth: item.border?.width
        ? item.border?.width * layoutPx.ratio
        : null,
      borderColor: item.border?.color?.value,

      background: item.background?.color?.value,
    };
    // If item is moving, set location to mouse postion
    if (move.x !== -1 && index === selected)
      defaultStyle = {
        ...defaultStyle,
        left: move.x * layoutPx.ratio,
        top: move.y * layoutPx.ratio,
      };

    // layer.var to string
    const getFormattedValue = () => {
      return item.var
        ? item.var.reduce(
            (str, o) =>
              `${str}${
                o.group === GROUP.DATA && data[page] && o.value in data[page]
                  ? data[page][o.value]
                  : o.label
              }`,
            ""
          )
        : "";
    };

    switch (item.type) {
      case TYPE.rect:
      case TYPE.circle:
        return (
          <div
            key={`layer-${item.name}`}
            ref={(el) => (refLayer.current[index] = el)}
            onMouseDown={(event) => onMouseDown(event, index)}
            style={{
              ...defaultStyle,

              width: item.size.w * layoutPx.ratio,
              height: item.size.h * layoutPx.ratio,

              borderRadius: item.type === TYPE.circle ? "50%" : 0,
            }}
          ></div>
        );
      case TYPE.text:
        let fontScale = {};
        if (item.font?.size) {
          fontScale.fontSize = item.font.size * layoutPx.ratio;
          if (fontScale.fontSize < 10) {
            fontScale.transformOrigin = "top left";
            fontScale.transform = `scale(${fontScale.fontSize / 10})`;
            fontScale.fontSize = 10;
          }
        } else fontScale.fontSize = 10 * layoutPx.ratio;

        return (
          <Text
            id={`layer-${item.name}`}
            key={`layer-${item.name}`}
            ref={(el) => (refLayer.current[index] = el)}
            onMouseDown={(event) => onMouseDown(event, index)}
            style={{
              ...defaultStyle,

              WebkitUserSelect: "none" /* Safari */,
              msUserSelect: "none" /* IE 10 and IE 11 */,
              userSelect: "none" /* Standard syntax */,

              fontFamily: item.font?.family,
              fontStyle: item.font?.style,
              ...fontScale,

              fontWeight: item.font?.weight,
              color: item.font?.color?.value,
            }}
          >
            {getFormattedValue()}
          </Text>
        );
      case TYPE.bar:
        const value = getFormattedValue();
        return (
          <div
            id={`layer-${item.name}`}
            key={`layer-${item.name}`}
            ref={(el) => (refLayer.current[index] = el)}
            onMouseDown={(event) => onMouseDown(event, index)}
            style={defaultStyle}
          >
            <Barcode
              value={value ? value : " "}
              displayValue={false}
              height={item.size.h * layoutPx.ratio}
              width={(item.border?.width ?? 1) * layoutPx.ratio}
              margin={0}
              background={item.background?.value ?? "transparent"}
              lineColor={item.border?.color?.value}
            />
          </div>
        );
      case TYPE.qr:
        return (
          <div
            key={`layer-${item.name}`}
            ref={(el) => (refLayer.current[index] = el)}
            onMouseDown={(event) => onMouseDown(event, index)}
            style={defaultStyle}
          >
            <QRCodeSVG
              size={item.size.w * layoutPx.ratio}
              value={getFormattedValue()}
            />
          </div>
        );
      case TYPE.image:
        return (
          <ManImage
            src={
              item.var?.format &&
              item.var.img &&
              data[page] &&
              data[page][item.var.format] &&
              item.var.img[data[page][item.var.format]]
                ? item.var.img[data[page][item.var.format]]
                : item.var.default
            }
            width={item.size.w * layoutPx.ratio}
            height={item.size.h * layoutPx.ratio}
            key={`layer-${item.name}`}
            ref={(el) => (refLayer.current[index] = el)}
            onMouseDown={(event) => onMouseDown(event, index)}
            style={defaultStyle}
            fit="contain"
          />
        );
      default:
        return null;
    }
  });

  return (
    <Paper
      sx={{
        position: "relative",
        width: layoutPx.w * layoutPx.ratio,
        height: layoutPx.h * layoutPx.ratio,
        boxSizing: "content-box",
        background: "#fff",
      }}
      ref={refCanvas}
      radius={0}
      withBorder
      onMouseDown={() => dispatch(setSelected(-1))}
    >
      {items}
      {selected !== -1 && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",

            left:
              move.x === -1
                ? layer[selected].size.x * layoutPx.ratio - 1
                : move.x * layoutPx.ratio - 1,
            top:
              move.y === -1
                ? layer[selected].size.y * layoutPx.ratio - 1
                : move.y * layoutPx.ratio - 1,
            width: selectedLayerSize().w * layoutPx.ratio + 2,
            height: selectedLayerSize().h * layoutPx.ratio + 2,

            backgroundImage:
              "repeating-linear-gradient(0deg, #0000ff, #0000ff 4px, transparent 4px, transparent 8px, #0000ff 8px), repeating-linear-gradient(90deg, #0000ff, #0000ff 4px, transparent 4px, transparent 8px, #0000ff 8px), repeating-linear-gradient(180deg, #0000ff, #0000ff 4px, transparent 4px, transparent 8px, #0000ff 8px), repeating-linear-gradient(270deg, #0000ff, #0000ff 4px, transparent 4px, transparent 8px, #0000ff 8px)",
            backgroundSize:
              "1px calc(100% + 8px), calc(100% + 8px) 1px, 1px calc(100% + 8px) , calc(100% + 8px) 1px",
            backgroundPosition: "0 0, 0 0, 100% 0, 0 100%",
            backgroundRepeat: "no-repeat",
            animation: "borderAnimation 0.4s infinite linear",
          }}
        ></div>
      )}
    </Paper>
  );
}
