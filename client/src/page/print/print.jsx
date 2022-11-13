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
  Tooltip,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertTriangle,
  IconCopy,
  IconFilter,
  IconInfoCircle,
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
import {
  UNIT,
  CONTAINER_HEIGHT,
  convertSize,
  PAPER_TYPE,
} from "../calibrate/paperSlice";
import { setFilter, setQtyFormat } from "./copySlice";
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
      {props.pages.map((page) => {
        const item = (
          <div
            key={`paper-entry-${page}`}
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
  const qtyFormat = useSelector((state) => state.copy.qtyFormat);
  const filter = useSelector((state) => state.copy.filter);
  const isFiltered = filter.format && filter.value;

  const [reqPrint, setReqPrint] = useState(null);
  const [opened, { close, open }] = useDisclosure(false);

  let filteredIndexMap = [];
  if (isFiltered)
    data.forEach((o, i) => {
      if (o[filter.format] === filter.value) filteredIndexMap.push(i);
    });

  // For index badge size
  const lastIndex =
    filteredIndexMap[filteredIndexMap.length - 1] ?? data.length;

  const qtyPerPaper =
    Math.floor(
      1 +
        (paperLayoutPx.w - paperLayoutPx.l - drawLayoutPx.w) /
          (drawLayoutPx.w + paperLayoutPx.r)
    ) *
    Math.floor(
      1 +
        (paperLayoutPx.h - paperLayoutPx.t - drawLayoutPx.h) /
          (drawLayoutPx.h + paperLayoutPx.b)
    );

  const Row = ({ index, style }) => {
    if (isFiltered) index = filteredIndexMap[index];

    const qty =
      qtyFormat && Number(data[index][qtyFormat])
        ? Math.floor(Number(data[index][qtyFormat]))
        : 1;

    return (
      <Group
        noWrap
        position={paperLayout.type === PAPER_TYPE.fit ? "center" : "left"}
        key={`preview-${index}`}
        style={style}
      >
        <div
          style={{
            width: 45 + 5 * (String(lastIndex).match(/\d/g) ?? []).length,
          }}
        >
          <Badge variant="filled" color="gray" fullWidth>
            # {index}
          </Badge>
        </div>

        <div
          style={{
            border: "1px solid rgb(222, 226, 230)",
          }}
        >
          <LabelPaper
            pages={new Array(qtyPerPaper)
              .fill(0)
              .map((_, j) => index * qtyPerPaper + j)}
          />
        </div>
        <Tooltip
          styles={(theme) => {
            return {
              tooltip: {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? "rgba(37, 38, 43, 0.8)"
                    : "rgba(33, 37, 41, 0.8)",
              },
            };
          }}
          position="right"
          withArrow
          multiline
          label={
            <>
              <Title order={5} align="center">
                # {index}
              </Title>
              <Divider my={4} />
              {Object.entries(data[index]).map(([k, v], j) => (
                <Group key={`tooltip-${index}-${j}`} spacing="xs">
                  <Title order={6}>{k}</Title>
                  <Text size="xs">{v}</Text>
                </Group>
              ))}
            </>
          }
        >
          <IconInfoCircle color="gray" />
        </Tooltip>
        <Stack align="center" spacing={0}>
          <Badge
            variant={qty > RECOMMENDED_COUNT ? "filled" : "outline"}
            color={qty > RECOMMENDED_COUNT ? "red" : "gray"}
            size="xs"
          >
            {qty}
          </Badge>
          <ActionIcon
            onClick={() => {
              if (qty > MAX_COUNT)
                showNotification({
                  title: "Too many quantity",
                  message: `The system cannot print more than ${MAX_COUNT} copies.`,
                  color: "red",
                });
              else if (qty > RECOMMENDED_COUNT) {
                setReqPrint(-index);
                open();
              } else setReqPrint(index);
            }}
          >
            <IconPrinter />
          </ActionIcon>
        </Stack>
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
            {new Array(qty).fill(0).map((_, j) => (
              <Canvas page={index} key={`canvas-${index}-${j}`} />
            ))}
          </NewWindow>
        )}
      </Group>
    );
  };

  return (
    <>
      <FixedSizeList
        width="100%"
        height={CONTAINER_HEIGHT}
        className="List"
        itemCount={Math.ceil(
          (isFiltered
            ? data.filter((o) => o[filter.format] === filter.value).length
            : data.length) / qtyPerPaper
        )}
        itemSize={paperLayoutPx.h + 10}
      >
        {Row}
      </FixedSizeList>
      <PrintModal
        qty={
          qtyFormat &&
          reqPrint !== null &&
          Number(data[Math.abs(reqPrint)][qtyFormat])
            ? Number(data[Math.abs(reqPrint)][qtyFormat])
            : 1
        }
        opened={opened}
        close={close}
        onAgree={() => {
          setReqPrint(Math.abs(reqPrint));
          close();
        }}
        onDisagree={close}
      />
    </>
  );
}
function Control() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);
  const qtyFormat = useSelector((state) => state.copy.qtyFormat);
  const filter = useSelector((state) => state.copy.filter);

  const [reqPrint, setReqPrint] = useState(false);
  const [opened, { close, open }] = useDisclosure(false);

  const canFilter = filter.format && filter.value;
  let qty = (
    canFilter ? data.filter((o) => o[filter.format] === filter.value) : data
  ).reduce(
    (acc, o) =>
      acc +
      (qtyFormat && Number(o[qtyFormat])
        ? Math.floor(Number(o[qtyFormat]))
        : 1),
    0
  );

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
        variant={qty > RECOMMENDED_COUNT ? "filled" : "outline"}
        color={qty > RECOMMENDED_COUNT ? "red" : "gray"}
        size="xs"
      >
        {qty}
      </Badge>
      <ActionIcon
        size={128}
        variant="filled"
        radius="md"
        onClick={() => {
          if (qty > MAX_COUNT)
            showNotification({
              title: "Too many quantity",
              message: `The system cannot print more than ${MAX_COUNT} copies.`,
              color: "red",
            });
          else if (qty > RECOMMENDED_COUNT) open();
          else setReqPrint(true);
        }}
      >
        <IconPrinter size={128} />
      </ActionIcon>
      <PrintModal
        qty={qty}
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
          {canFilter
            ? data.map((o, i) =>
                o[filter.format] === filter.value
                  ? new Array(o[qtyFormat])
                      .fill(0)
                      .map((_, j) => (
                        <Canvas page={i} key={`canvas-${i}-${j}`} />
                      ))
                  : []
              )
            : data.map((o, i) =>
                new Array(o[qtyFormat])
                  .fill(0)
                  .map((_, j) => <Canvas page={i} key={`canvas-${i}-${j}`} />)
              )}
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
