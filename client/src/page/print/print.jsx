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
  Modal,
  useMantineTheme,
  Button,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertTriangle,
  IconCopy,
  IconFilter,
  IconPrinter,
  IconVariable,
} from "@tabler/icons";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FixedSizeList } from "react-window";
import NewWindow from "react-new-window";
import { TYPE, GROUP, DETAIL_ICON_SIZE } from "../design/drawSlice";
import { UNIT, CONTAINER_HEIGHT, convertSize } from "../calibrate/paperSlice";
import { calculatePageMap, setFilter, setQtyFormat } from "./copySlice";
import { showNotification } from "@mantine/notifications";

const RECOMMENDED_COUNT = 1000;
const MAX_COUNT = 10000;

function Canvas(props) {
  // Provider
  const data = useSelector((state) => state.data.value);
  const layoutPx = convertSize(
    useSelector((state) => state.draw.layout),
    UNIT.px
  );
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

    // layer.var to string
    const getFormattedValue = () => {
      return item.var
        ? item.var.reduce(
            (str, o) =>
              `${str}${
                o.group === GROUP.DATA &&
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
        let fontScale = {};
        if (item.font?.size) {
          fontScale.fontSize = item.font.size;
        } else fontScale.fontSize = 10;

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
function LabelPaper(props) {
  const drawLayoutPx = convertSize(
    useSelector((state) => state.draw.layout),
    UNIT.px
  );
  const paperLayoutPx = convertSize(
    useSelector((state) => state.paper.layout),
    UNIT.px
  );
  let x = paperLayoutPx.l,
    y = paperLayoutPx.t;

  return (
    <Paper
      sx={{
        position: "relative",
        width: paperLayoutPx.w,
        height: paperLayoutPx.h,
        boxSizing: "content-box",
        background: "#fff",
      }}
      radius={0}
    >
      {props.pages.map((page, i) => {
        const item =
          page === -1 ? null : (
            <div
              key={`paper-entry-${i}`}
              style={{ position: "absolute", left: x, top: y }}
            >
              <Canvas page={page} />
            </div>
          );

        x += drawLayoutPx.w + paperLayoutPx.r;
        // if item overflow from paper
        if (x >= paperLayoutPx.w - drawLayoutPx.w) {
          x = paperLayoutPx.l;
          y += drawLayoutPx.h + paperLayoutPx.b;
        }

        return item;
      })}
    </Paper>
  );
}
function PrintModal(props) {
  const qty = props.qty;
  const opened = props.opened;
  const close = props.close;
  const onAgree = props.onAgree;
  const onDisagree = props.onDisagree;

  const theme = useMantineTheme();

  return (
    <Modal
      opened={opened}
      onClose={close}
      size="auto"
      title={
        <Group>
          <IconAlertTriangle size={48} color="#FAB005" />
          <Title order={4}>Bulk Print Warning</Title>
        </Group>
      }
      overlayColor={
        theme.colorScheme === "dark"
          ? theme.colors.dark[9]
          : theme.colors.gray[2]
      }
      overlayOpacity={0.55}
      overlayBlur={3}
    >
      <Text>
        You tried to print <b>{qty}</b> copies more than {RECOMMENDED_COUNT}{" "}
        that recommended.
      </Text>
      <Text>
        It causes the browser to freeze, but you can print after waiting for
        rendering.
      </Text>
      <Text mt="xs">Are you still going to proceed?</Text>

      <Group mt="xl" position="apart">
        <Button onClick={onDisagree}>No, I will not print</Button>
        <Button onClick={onAgree} variant="outline">
          Yes, I will print
        </Button>
      </Group>
    </Modal>
  );
}
function Preview() {
  // Provider
  const data = useSelector((state) => state.data.value);
  const drawLayoutPx = convertSize(
    useSelector((state) => state.draw.layout),
    UNIT.px
  );
  const paperLayout = useSelector((state) => state.paper.layout);
  const paperLayoutPx = convertSize(paperLayout, UNIT.px);
  const filter = useSelector((state) => state.copy.filter);
  const qtyFormat = useSelector((state) => state.copy.qtyFormat);

  const [reqPrint, setReqPrint] = useState(null);

  const pageMap = calculatePageMap(
    data,
    paperLayoutPx,
    drawLayoutPx,
    filter,
    qtyFormat
  );

  const Row = ({ index, style }) => (
    <Stack key={`preview-${index}`} align="center" spacing={1} style={style}>
      <Group
        style={{
          width: paperLayoutPx.w,
        }}
        spacing="xs"
        align="flex-end"
      >
        <Title order={6} color="gray">
          {index + 1}p
        </Title>
        <Text size="xs" color="gray">
          #{pageMap[index].join(" #")}
        </Text>
      </Group>
      <div
        style={{
          border: "1px solid rgb(222, 226, 230)",
          cursor: "pointer",
        }}
        onClick={() => setReqPrint(index)}
      >
        <LabelPaper pages={pageMap[index]} preview />
      </div>
      {reqPrint === index && (
        // Here make DOMException: Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules
        // There is CORS problem. But we can ignore it.
        <NewWindow
          title="Print Labels"
          onUnload={() => {
            setReqPrint(null);
          }}
          onBlock={() =>
            showNotification({
              title: "New window opening blocked",
              message: "The browser restricts opening a new window",
              color: "red",
            })
          }
          onOpen={(w) => {
            w.moveTo(0, 0);
            w.resizeTo(window.screen.availWidth, window.screen.availHeight);
            w.print();
          }}
        >
          <LabelPaper pages={pageMap[index]} />
        </NewWindow>
      )}
    </Stack>
  );

  return (
    <>
      <FixedSizeList
        width="100%"
        height={CONTAINER_HEIGHT}
        className="List"
        itemCount={pageMap.length}
        itemSize={paperLayoutPx.h + 30}
      >
        {Row}
      </FixedSizeList>
    </>
  );
}
function Control() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);
  const drawLayoutPx = convertSize(
    useSelector((state) => state.draw.layout),
    UNIT.px
  );
  const paperLayoutPx = convertSize(
    useSelector((state) => state.paper.layout),
    UNIT.px
  );
  const qtyFormat = useSelector((state) => state.copy.qtyFormat);
  const filter = useSelector((state) => state.copy.filter);
  const pageMap = calculatePageMap(
    data,
    paperLayoutPx,
    drawLayoutPx,
    filter,
    qtyFormat
  );

  const [reqPrint, setReqPrint] = useState(false);
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <Stack pt="xl" align="center" spacing="xs">
      <Group noWrap>
        <Select
          size="xs"
          placeholder="Filter column"
          clearable
          icon={<IconFilter size={DETAIL_ICON_SIZE} />}
          transitionDuration={100}
          transition="pop-top-left"
          transitionTimingFunction="ease"
          data={Object.keys(data.length ? data[0] : []).map((s) => {
            return { value: s, label: s };
          })}
          value={filter.format}
          onChange={(value) =>
            dispatch(
              setFilter({
                format: value,
                value: value === filter.format ? filter.value : null,
              })
            )
          }
        />
        <Select
          size="xs"
          placeholder="Filter value"
          disabled={!filter.format}
          icon={<IconVariable size={DETAIL_ICON_SIZE} />}
          transitionDuration={100}
          transition="pop-top-left"
          transitionTimingFunction="ease"
          data={
            filter.format
              ? [
                  ...new Set(
                    new Array(data.length)
                      .fill(0)
                      .map((_, i) => data[i][filter.format])
                  ),
                ]
                  .map((v) => {
                    return { value: v, label: v };
                  })
                  .sort((a, b) => (a.value < b.value ? -1 : 1))
              : []
          }
          value={filter.value}
          onChange={(value) => dispatch(setFilter({ ...filter, value }))}
        />
      </Group>
      <Select
        size="xs"
        mt="md"
        placeholder="Copies column"
        clearable
        icon={<IconCopy size={DETAIL_ICON_SIZE} />}
        transitionDuration={100}
        transition="pop-top-left"
        transitionTimingFunction="ease"
        data={Object.keys(data.length ? data[0] : []).map((s) => {
          return { value: s, label: s };
        })}
        value={qtyFormat}
        onChange={(value) => dispatch(setQtyFormat(value))}
      />

      <Badge
        variant={pageMap.length > RECOMMENDED_COUNT ? "filled" : "outline"}
        color={pageMap.length > RECOMMENDED_COUNT ? "red" : "gray"}
        size="xs"
      >
        {pageMap.length}
      </Badge>
      <ActionIcon
        size={128}
        variant="filled"
        radius="md"
        onClick={() => {
          if (pageMap.length > MAX_COUNT)
            showNotification({
              title: "Too many quantity",
              message: `The system cannot print more than ${MAX_COUNT} copies.`,
              color: "red",
            });
          else if (pageMap.length > RECOMMENDED_COUNT) open();
          else setReqPrint(true);
        }}
      >
        <IconPrinter size={128} />
      </ActionIcon>
      <PrintModal
        qty={pageMap.length}
        opened={opened}
        close={close}
        onAgree={() => {
          setReqPrint(true);
          close();
        }}
        onDisagree={close}
      />

      {reqPrint && (
        // Here make DOMException: Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules
        // There is CORS problem. But we can ignore it.
        <NewWindow
          title="Print Labels"
          onUnload={() => {
            setReqPrint(false);
          }}
          onBlock={() =>
            showNotification({
              title: "New window opening blocked",
              message: "The browser restricts opening a new window",
              color: "red",
            })
          }
          onOpen={(w) => {
            w.moveTo(0, 0);
            w.resizeTo(window.screen.availWidth, window.screen.availHeight);
            w.print();
          }}
        >
          {calculatePageMap(
            data,
            paperLayoutPx,
            drawLayoutPx,
            filter,
            qtyFormat
          ).map((pages) => (
            <LabelPaper pages={pages} />
          ))}
        </NewWindow>
      )}
    </Stack>
  );
}

export default function Print() {
  return (
    <Grid m={0} p="sm" pt="xl">
      <Grid.Col md={3} orderMd={1}>
        <Control />
      </Grid.Col>
      <Grid.Col md={9} orderMd={0}>
        <Preview />
      </Grid.Col>
    </Grid>
  );
}
