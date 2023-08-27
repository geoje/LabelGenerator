import { Text, Paper, Image as ManImage } from "@mantine/core";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { useSelector } from "react-redux";
import { TYPE, GROUP_VAR, GROUP_FONT } from "../../lib/drawSlice";
import { UNIT, convertSize } from "../../lib/paperSlice";

export function Canvas(props: any) {
  // Provider
  const data = useSelector((state: any) => state.data.value);
  const layoutPx = convertSize(
    useSelector((state: any) => state.draw.layout),
    UNIT.px
  );
  const layer = useSelector((state: any) => state.draw.layer);

  const items = layer.map((_: any, i: any) => {
    const index = layer.length - 1 - i;
    const item = layer[index];

    let defaultStyle: React.CSSProperties = {
      position: "absolute",
      left: item.size.x,
      top: item.size.y,

      borderStyle: item.border?.style,
      borderWidth: item.border?.width ? item.border?.width : null,
      borderColor: item.border?.color?.value,

      background: item.background?.color?.value,
    };

    // layer.var to string
    const getFormattedValue = () => {
      return item.var
        ? item.var.reduce(
            (str: any, o: any) =>
              `${str}${
                o.group === GROUP_VAR.DATA &&
                data[props.page] &&
                o.value in data[props.page]
                  ? data[props.page][o.value]
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
            style={{
              ...defaultStyle,

              width: item.size.w,
              height: item.size.h,

              borderRadius: item.type === TYPE.circle ? "50%" : 0,
            }}
          ></div>
        );
      case TYPE.text:
        return (
          <Text
            id={`layer-${item.name}`}
            key={`layer-${item.name}`}
            style={{
              ...defaultStyle,

              WebkitUserSelect: "none" /* Safari */,
              msUserSelect: "none" /* IE 10 and IE 11 */,
              userSelect: "none" /* Standard syntax */,

              fontFamily:
                item.font?.family?.group === GROUP_FONT.FILE
                  ? `"${item.font.family.value}"`
                  : item.font?.family?.value,
              fontStyle: item.font?.style,
              fontSize: item.font?.size ?? 10,
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
        return (
          <div key={`layer-${item.name}`} style={defaultStyle}>
            <Barcode
              value={getFormattedValue()}
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
          <div key={`layer-${item.name}`} style={defaultStyle}>
            <QRCodeSVG size={item.size.w} value={getFormattedValue()} />
          </div>
        );
      case TYPE.image:
        return (
          <ManImage
            src={
              item.var?.format &&
              item.var.img &&
              data[props.page] &&
              data[props.page][item.var.format] &&
              item.var.img[data[props.page][item.var.format]]
                ? item.var.img[data[props.page][item.var.format]]
                : item.var.default
            }
            width={item.size.w}
            height={item.size.h}
            key={`layer-${item.name}`}
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
        width: layoutPx.w,
        height: layoutPx.h,
        boxSizing: "content-box",
        background: "#fff",
      }}
      radius={0}
    >
      {items}
    </Paper>
  );
}
