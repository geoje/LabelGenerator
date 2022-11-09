import {
  ActionIcon,
  Grid,
  Group,
  Text,
  Paper,
  Image as ManImage,
  Badge,
  Select,
  Stack,
} from "@mantine/core";
import { IconPrinter } from "@tabler/icons";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FixedSizeList } from "react-window";
import ReactToPrint from "react-to-print";
import { TYPE, convertLayout } from "../design/design";
import { setFormat } from "./copySlice";

function Canvas(props) {
  // Provider
  const data = useSelector((state) => state.data.value);
  const format = useSelector((state) => state.qr.format);
  const layoutPx = convertLayout.px(useSelector((state) => state.draw.layout));
  const layer = useSelector((state) => state.draw.layer);

  const items = layer.map((_, i) => {
    const index = layer.length - 1 - i;
    const item = layer[index];

    let defaultStyle = {
      position: "absolute",
      left: item.size.x,
      top: item.size.y,

      borderStyle: item.border?.style,
      borderWidth: item.border?.width ? item.border?.width : null,
      borderColor: item.border?.color?.value,

      background: item.background?.color?.value,
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
            {item.var.type === "format"
              ? data.length && Object.keys(data[0]).includes(item.var.format)
                ? data[props.page][item.var.format]
                : ""
              : item.var.static}
          </Text>
        );
      case TYPE.qr:
        return (
          <div key={`layer-${item.name}`} style={defaultStyle}>
            <QRCodeSVG
              size={item.size.w}
              value={
                data.length
                  ? format
                      .filter(
                        (o) =>
                          o.literal || Object.keys(data[0]).includes(o.value)
                      )
                      .map((o) =>
                        o.literal ? o.value : data[props.page][o.value]
                      )
                      .join("")
                  : ""
              }
            />
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
      style={props.style}
      key={props.key}
    >
      {items}
    </Paper>
  );
}
function Preview() {
  // Provider
  const data = useSelector((state) => state.data.value);
  const format = useSelector((state) => state.copy.format);
  const layoutPx = convertLayout.px(useSelector((state) => state.draw.layout));

  const refCanvas = [];

  const pageStyle = `
  @media print {
    .pv-wrap { border: none !important; }
    .pv-wrap > div { display: block !important; border: none !important; page-break-before: always; }
  }
`;

  const Row = ({ index, style }) => {
    const qty =
      format && Number(data[index][format]) ? Number(data[index][format]) : 1;
    const extraCanvas = Array.from({ length: qty - 1 }).map((_, j) => (
      <Canvas
        page={index}
        style={{ display: "none" }}
        key={`preview-${index}-${j}`}
      />
    ));

    return (
      <Group
        className="pv"
        position="center"
        key={`preview-${index}`}
        p={2}
        style={style}
      >
        <div className="pv-tool" style={{ width: 50 }}>
          <Badge variant="filled" color="gray" fullWidth>
            {index}
          </Badge>
        </div>
        <div
          ref={(el) => (refCanvas[index] = el)}
          className="pv-wrap"
          style={{ border: "1px solid #dee2e6" }}
        >
          <Canvas page={index} />
          {qty >= 2 && extraCanvas}
        </div>
        <Stack className="pv-tool" spacing={0}>
          <Badge variant="outline" color="gray" size="xs">
            {qty}
          </Badge>
          <ReactToPrint
            trigger={() => {
              return (
                <ActionIcon>
                  <IconPrinter />
                </ActionIcon>
              );
            }}
            content={() => refCanvas[index]}
            pageStyle={pageStyle}
          />
        </Stack>
      </Group>
    );
  };

  return (
    <FixedSizeList
      width="100%"
      height={800}
      className="List"
      itemCount={data.length}
      itemSize={layoutPx.h + 6}
    >
      {Row}
    </FixedSizeList>
  );
}

export default function Print() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);
  const format = useSelector((state) => state.copy.format);

  const refPreview = useRef(null);
  const pageStyle = `
  @media print {
    .pvs, .pv { padding: 0 !important; page-break-before: always; }
    .pv-tool { display: none !important; }
    .pv-wrap { border: none !important; }
    .pv-wrap > div { display: block !important; border: none !important; page-break-before: always; }
  }
`;

  return (
    <Grid m={0} p="sm" pt="xl">
      <Grid.Col md={4} orderMd={1}>
        <Stack pt="xl" align="center" spacing="xl">
          <Select
            size="xs"
            placeholder="Copies from column"
            clearable
            data={Object.keys(data.length ? data[0] : []).map((s) => {
              return { value: s, label: s };
            })}
            value={format}
            onChange={(value) => dispatch(setFormat(value))}
          />
          <ReactToPrint
            trigger={() => {
              return (
                <ActionIcon
                  size={128}
                  variant="filled"
                  radius="md"
                  onClick={() => {}}
                >
                  <IconPrinter size={128} />
                </ActionIcon>
              );
            }}
            content={() => refPreview.current}
            pageStyle={pageStyle}
          />
        </Stack>
      </Grid.Col>
      <Grid.Col md={8} orderMd={0} ref={refPreview} className="pvs">
        <Preview />
      </Grid.Col>
    </Grid>
  );
}
