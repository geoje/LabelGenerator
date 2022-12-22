import { Paper, Text, Image as ManImage } from "@mantine/core";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import {
  TYPE,
  GROUP_VAR,
  convertSize,
  removeLayerByIndex,
  setLayerSize,
  setSelected,
  getLayerSize,
} from "./drawSlice";
import { UNIT } from "../calibrate/paperSlice";

export function Canvas() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);
  const page = useSelector((state) => state.draw.page);
  const layoutPx = convertSize(
    useSelector((state) => state.draw.layout),
    UNIT.px
  );
  const layer = useSelector((state) => state.draw.layer);
  let selected = useSelector((state) => state.draw.selected);

  const refCanvas = useRef();
  const refLayer = useRef({ current: [] });
  let [move, setMove] = useState({ x: -1, y: -1, ox: 0, oy: 0, sx: 0, sy: 0 });

  const onMouseMove = (event) => {
    event.preventDefault();

    const vertical =
      Math.abs(event.pageX - move.sx) < Math.abs(event.pageY - move.sy);
    const layerSize = getLayerSize(layer[selected], layoutPx.ratio);

    setMove(
      (move = {
        ...move,
        x: Math.round(
          Math.max(
            0,
            Math.min(
              (layoutPx.w - layerSize.w) * layoutPx.ratio,
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
              (layoutPx.h - layerSize.h) * layoutPx.ratio,
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
            (l.type === TYPE.text ? l.font?.scale?.w ?? 1 : 1) +
          1,
        oy:
          event.nativeEvent.offsetY *
            (l.type === TYPE.text ? l.font?.scale?.h ?? 1 : 1) +
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
    const onKeyDown = (event) => {
      if (selected === -1) return;

      if (event.key === "Delete") {
        dispatch(removeLayerByIndex(selected));
        return;
      }

      const layerSize = getLayerSize(layer[selected], layoutPx.ratio);
      let d = {
        x: (event.key === "ArrowRight") - (event.key === "ArrowLeft"),
        y: (event.key === "ArrowDown") - (event.key === "ArrowUp"),
      };
      if (d.x === 0 && d.y === 0) return;

      dispatch(
        setLayerSize({
          index: selected,
          size: {
            ...layer[selected].size,
            x: Math.max(
              0,
              Math.min(layoutPx.w - layerSize.w, layer[selected].size.x + d.x)
            ),
            y: Math.max(
              0,
              Math.min(layoutPx.h - layerSize.h, layer[selected].size.y + d.y)
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
                o.group === GROUP_VAR.DATA &&
                data[page] &&
                o.value in data[page]
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

              fontFamily: item.font?.family?.value,
              fontStyle: item.font?.style,
              fontSize: (item.font?.size ?? 10) * layoutPx.ratio,
              transformOrigin: "left top",
              transform: `scale(${item.font?.scale?.w ?? 1}, ${
                item.font?.scale?.h ?? 1
              })`,

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
            ...(() => {
              const size = getLayerSize(layer[selected], layoutPx.ratio);
              return {
                width: size.w * layoutPx.ratio + 2,
                height: size.h * layoutPx.ratio + 2,
              };
            })(),

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
