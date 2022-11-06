import {
  ActionIcon,
  Grid,
  Group,
  Text,
  Paper,
  Image as ManImage,
  Badge,
  Center,
} from "@mantine/core";
import { IconPrinter } from "@tabler/icons";
import { QRCodeSVG } from "qrcode.react";
import { useSelector } from "react-redux";
import ReactToPrint from "react-to-print";
import { TYPE, convertLayout } from "../design/design";

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
              fontSize: item.font?.size ? item.font.size : 10,
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
      ref={props.innerRef}
      withBorder
    >
      {items}
    </Paper>
  );
}
function Preview() {
  // Provider
  const data = useSelector((state) => state.data.value);
  const layout = useSelector((state) => state.draw.layout);

  const refCanvas = [];
  const previews = [];

  const pageStyle = `
  @page {
    size: 80mm 50mm;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;

  for (let i = 0; i < data.length; i++)
    previews.push(
      <Group position="center" key={`preview-${i}`} p={2}>
        <div style={{ width: 60 }}>
          <Badge variant="filled" color="gray" fullWidth>
            {i}
          </Badge>
        </div>
        <Canvas page={i} innerRef={(el) => (refCanvas[i] = el)} />
        <ReactToPrint
          trigger={() => {
            return (
              <ActionIcon>
                <IconPrinter />
              </ActionIcon>
            );
          }}
          content={() => refCanvas[i]}
          pageStylexc
        />
      </Group>
    );

  return <>{previews}</>;
}

function Control() {
  const layout = useSelector((state) => state.draw.layout);

  return (
    <Center pt="xl">
      <ActionIcon
        size={128}
        variant="filled"
        radius="md"
        onClick={() =>
          console.log(
            `@media print { @page { size: ${layout.w}${layout.unit.substring(
              0,
              2
            )} ${layout.h}${layout.unit.substring(0, 2)} } }`
          )
        }
      >
        <IconPrinter size={128} />
      </ActionIcon>
    </Center>
  );
}

export default function Print() {
  return (
    <Grid pt="xl">
      <Grid.Col md={4} orderMd={1}>
        <Control />
      </Grid.Col>
      <Grid.Col md={8} orderMd={0}>
        <Preview />
      </Grid.Col>
    </Grid>
  );
}
