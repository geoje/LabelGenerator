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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle, IconInfoCircle, IconPrinter } from "@tabler/icons";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FixedSizeList } from "react-window";
import NewWindow from "react-new-window";
import { TYPE, convertLayout } from "../design/design";
import { setFilter, setQtyFormat } from "./copySlice";
import { showNotification } from "@mantine/notifications";

const RECOMMENDED_COUNT = 1000;
const MAX_COUNT = 10000;

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
          fontScale.fontSize = item.font.size;
          if (fontScale.fontSize < 10) {
            fontScale.transformOrigin = "top left";
            fontScale.transform = `scale(${fontScale.fontSize / 10})`;
            fontScale.fontSize = 10;
          }
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
    >
      {items}
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
  const layout = useSelector((state) => state.draw.layout);
  const layoutPx = convertLayout.px(layout);
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
  const Row = ({ index, style }) => {
    if (isFiltered) index = filteredIndexMap[index];

    const qty =
      qtyFormat && Number(data[index][qtyFormat])
        ? Number(data[index][qtyFormat])
        : 1;

    return (
      <Group position="center" key={`preview-${index}`} style={style}>
        <div style={{ width: 50 }}>
          <Badge variant="filled" color="gray" fullWidth>
            {index}
          </Badge>
        </div>
        <div style={{ border: "1px solid rgb(222, 226, 230)" }}>
          <Canvas page={index} />
        </div>
        <Tooltip
          position="left"
          withArrow
          multiline
          label={
            <>
              <Title order={6} align="center">
                {index}
              </Title>
              {Object.entries(data[index]).map(([k, v], j) => (
                <Text size="xs" key={`tooltip-${index}-${j}`}>
                  {k}: {v}
                </Text>
              ))}
            </>
          }
        >
          <Text color="gray">
            <IconInfoCircle />
          </Text>
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
        height={800}
        className="List"
        itemCount={
          isFiltered
            ? data.filter((o) => o[filter.format] === filter.value).length
            : data.length
        }
        itemSize={layoutPx.h + 6}
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
  const canFilter = filter.format && filter.value;

  const [reqPrint, setReqPrint] = useState(false);
  const [opened, { close, open }] = useDisclosure(false);

  let qty = (
    canFilter ? data.filter((o) => o[filter.format] === filter.value) : data
  ).reduce((acc, o) => acc + (qtyFormat ? Number(o[qtyFormat]) : 1), 0);
  if (!qty) qty = 0;

  return (
    <Stack pt="xl" align="center" spacing="xs">
      <Group>
        <Select
          size="xs"
          placeholder="Filter Column"
          clearable
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
          placeholder="Filter Value"
          disabled={!filter.format}
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
        placeholder="Copies Column"
        clearable
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
      <Grid.Col md={4} orderMd={1}>
        <Control />
      </Grid.Col>
      <Grid.Col md={8} orderMd={0}>
        <Preview />
      </Grid.Col>
    </Grid>
  );
}
