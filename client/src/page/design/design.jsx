import {
  Grid,
  Group,
  NumberInput,
  Paper,
  Stack,
  ActionIcon,
  Select,
  Divider,
  Title,
  Slider,
  createStyles,
  Text,
  Tooltip,
} from "@mantine/core";
import React, { useRef } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircle,
  IconDeviceFloppy,
  IconFolder,
  IconQrcode,
  IconSquare,
  IconTypography,
  IconGripVertical,
  IconX,
  IconQuestionMark,
  IconPhoto,
} from "@tabler/icons";
import { setSize, setSizeRatio, setLayer, setLayerSize } from "./drawSlice";

const UNIT = { inch: "inch", cm: "cm", px: "px" };
const TYPE = {
  rect: "rect",
  circle: "circle",
  text: "text",
  image: "image",
  qr: "qr",
};

const convertSize = {
  inch: (size) => {
    if (size.unit === "cm")
      return {
        w: size.w / 2.54,
        h: size.h / 2.54,
        unit: "inch",
        ratio: size.ratio,
      };
    else if (size.unit === "px")
      return {
        w: size.w / 96,
        h: size.h / 96,
        unit: "inch",
        ratio: size.ratio,
      };
    else return size;
  },
  cm: (size) => {
    if (size.unit === "inch")
      return {
        w: size.w * 2.54,
        h: size.h * 2.54,
        unit: "cm",
        ratio: size.ratio,
      };
    else if (size.unit === "px")
      return {
        w: (size.w / 96) * 2.54,
        h: (size.h / 96) * 2.54,
        unit: "cm",
        ratio: size.ratio,
      };
    else return size;
  },
  px: (size) => {
    if (size.unit === "inch")
      return {
        w: Math.round(size.w * 96),
        h: Math.round(size.h * 96),
        unit: "px",
        ratio: size.ratio,
      };
    else if (size.unit === "cm")
      return {
        w: Math.round((size.w / 2.54) * 96),
        h: Math.round((size.h / 2.54) * 96),
        unit: "px",
        ratio: size.ratio,
      };
    else return size;
  },
};
const typeToIcon = (type) => {
  return type === TYPE.rect ? (
    <IconSquare />
  ) : type === TYPE.circle ? (
    <IconCircle />
  ) : type === TYPE.text ? (
    <IconTypography />
  ) : type === TYPE.image ? (
    <IconPhoto />
  ) : type === TYPE.qr ? (
    <IconQrcode />
  ) : (
    <IconQuestionMark />
  );
};

/** Left
 *
 * @returns
 */
function LayoutSize() {
  // Provider
  const dispatch = useDispatch();
  const size = useSelector((state) => state.draw.size);

  return (
    <Grid>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={size.w}
          size="xs"
          precision={size.unit === "px" ? 0 : 2}
          step={size.unit === "px" ? 1 : 0.1}
          onChange={(value) =>
            dispatch(
              setSize({
                ...size,
                w: value,
              })
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={size.h}
          size="xs"
          precision={size.unit === "px" ? 0 : 2}
          step={size.unit === "px" ? 1 : 0.1}
          onChange={(value) =>
            dispatch(
              setSize({
                ...size,
                h: value,
              })
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={12} xl={4}>
        <Select
          placeholder="Unit"
          size="xs"
          data={Object.keys(UNIT).map((s) => {
            return { value: s, label: s };
          })}
          value={size.unit}
          onChange={(value) => {
            if (value === size.unit) return;
            dispatch(setSize(convertSize[value](size)));
          }}
        />
      </Grid.Col>
      <Grid.Col>
        <Slider
          label={(val) => val * 100 + "%"}
          defaultValue={size.ratio}
          min={0.5}
          max={3}
          step={0.5}
          marks={[
            { value: 0.5 },
            { value: 1 },
            { value: 1.5 },
            { value: 2 },
            { value: 2.5 },
            { value: 3 },
          ]}
          styles={{ markLabel: { display: "none" } }}
          onChange={(value) => {
            dispatch(setSizeRatio(value));
          }}
        />
      </Grid.Col>
    </Grid>
  );
}
function Variable() {
  return <></>;
}

/** Middle
 *
 * @returns
 */
function Tool() {
  // Provider
  const dispatch = useDispatch();
  const sizePx = convertSize.px(useSelector((state) => state.draw.size));
  const format = useSelector((state) => state.qr.format);
  const layer = useSelector((state) => state.draw.layer);

  let [layerCount, setLayerCount] = useState(1);
  const prediectLayerName = (o) => o.name === "layer" + layerCount;
  const getLayerName = () => {
    while (layer.some(prediectLayerName)) layerCount++;
    setLayerCount(layerCount + 1);
    return "layer" + layerCount;
  };

  return (
    <Group position="center" spacing="xs">
      <Tooltip label="Load">
        <ActionIcon variant="subtle" onClick={() => {}}>
          <IconFolder />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Save">
        <ActionIcon variant="subtle" onClick={() => {}}>
          <IconDeviceFloppy />
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />
      <Tooltip label="Rectangle">
        <ActionIcon
          variant="subtle"
          onClick={() => {
            let tempLayer = [...layer];
            tempLayer.push({
              name: getLayerName(),
              type: TYPE.rect,
              size: {
                x: sizePx.w / 2 - 10,
                y: sizePx.h / 2 - 10,
                w: 20,
                h: 20,
              },
              border: {
                style: "solid",
                width: 1,
                color: "#000",
              },
            });
            dispatch(setLayer(tempLayer));
          }}
        >
          <IconSquare />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Circle">
        <ActionIcon
          variant="subtle"
          onClick={() => {
            let tempLayer = [...layer];
            tempLayer.push({
              name: getLayerName(),
              type: TYPE.circle,
              size: {
                x: sizePx.w / 2 - 10,
                y: sizePx.h / 2 - 10,
                w: 20,
                h: 20,
              },
              border: {
                style: "solid",
                width: 1,
                color: "#000",
              },
            });
            dispatch(setLayer(tempLayer));
          }}
        >
          <IconCircle />
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />
      <Tooltip label="Text">
        <ActionIcon variant="subtle" onClick={() => {}}>
          <IconTypography />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Image">
        <ActionIcon variant="subtle" onClick={() => {}}>
          <IconPhoto />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="QR Code">
        <ActionIcon
          variant="subtle"
          onClick={() => {
            console.log(format);
          }}
        >
          <IconQrcode />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
function Canvas() {
  // Provider
  const dispatch = useDispatch();
  const sizePx = convertSize.px(useSelector((state) => state.draw.size));
  const layer = useSelector((state) => state.draw.layer);

  const refCanvas = useRef();
  let [move, setMove] = useState({ index: -1, ox: 0, oy: 0 });

  const onMouseMove = (event) => {
    event.preventDefault();

    const textElement =
      layer[move.index].type === TYPE.text
        ? document.getElementById(`canvas-${layer[move.index].name}`)
        : null;
    const layerSize = {
      ...layer[move.index].size,
    };
    if (textElement) {
      layerSize.w = Math.ceil(textElement.offsetWidth / sizePx.ratio);
      layerSize.h = Math.ceil(textElement.offsetHeight / sizePx.ratio);
    }

    dispatch(
      setLayerSize({
        index: move.index,
        size: {
          ...layerSize,
          x:
            Math.max(
              0,
              Math.min(
                (sizePx.w - layerSize.w) * sizePx.ratio - 2,
                event.pageX - refCanvas.current.offsetLeft - move.ox
              )
            ) / sizePx.ratio,
          y:
            Math.max(
              0,
              Math.min(
                (sizePx.h - layerSize.h) * sizePx.ratio - 2,
                event.pageY - refCanvas.current.offsetTop - move.oy
              )
            ) / sizePx.ratio,
        },
      })
    );
  };
  const onMouseDown = (event, index) => {
    event.preventDefault();

    setMove(
      (move = {
        index,
        ox: event.nativeEvent.offsetX + 1,
        oy: event.nativeEvent.offsetY + 1,
      })
    );
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  const onMouseUp = (event) => {
    event.preventDefault();

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    setMove({ index: -1, ox: 0, oy: 0 });
  };

  const items = layer.map((_, i) => {
    const index = layer.length - 1 - i;
    const item = layer[index];
    switch (item.type) {
      case TYPE.rect:
      case TYPE.circle:
        return (
          <div
            key={`canvas-${item.name}`}
            onMouseDown={(event) => onMouseDown(event, index)}
            style={{
              position: "absolute",

              left: item.size.x * sizePx.ratio,
              top: item.size.y * sizePx.ratio,
              width: item.size.w * sizePx.ratio,
              height: item.size.h * sizePx.ratio,

              fontFamily: item.font?.family,
              fontSize: item.font ? item.font.size * sizePx.ratio : null,
              color: item.font?.color,

              borderStyle: item.border?.style,
              borderWidth: item.border
                ? item.border.width * sizePx.ratio
                : null,
              borderColor: item.border?.color,
              borderRadius: item.type === TYPE.circle ? "50%" : 0,

              backgroundColor: item.backgroundColor,
            }}
          ></div>
        );
      case TYPE.text:
        return (
          <Text
            id={`canvas-${item.name}`}
            key={`canvas-${item.name}`}
            onMouseDown={(event) => onMouseDown(event, index)}
            style={{
              position: "absolute",
              WebkitUserSelect: "none" /* Safari */,
              msUserSelect: "none" /* IE 10 and IE 11 */,
              userSelect: "none" /* Standard syntax */,

              left: item.size.x * sizePx.ratio,
              top: item.size.y * sizePx.ratio,
              width: item.size.w ? item.size.w * sizePx.ratio : null,
              height: item.size.h ? item.size.h * sizePx.ratio : null,

              fontFamily: item.font?.family,
              fontSize: item.font ? item.font.size * sizePx.ratio : null,
              color: item.font?.color,

              borderStyle: item.border?.style,
              borderWidth: item.border
                ? item.border.width * sizePx.ratio
                : null,
              borderColor: item.border?.color,
              borderRadius: item.type === TYPE.circle ? "50%" : 0,

              backgroundColor: item.backgroundColor,
            }}
          >
            {item.var.default}
          </Text>
        );
      default:
        return null;
    }
  });

  return (
    <Paper
      sx={{
        position: "relative",
        width: sizePx.w * sizePx.ratio,
        height: sizePx.h * sizePx.ratio,
      }}
      ref={refCanvas}
      radius={0}
      shadow="xs"
      withBorder
    >
      {items}
    </Paper>
  );
}
function Pagenation() {
  // Provider
  const data = useSelector((state) => state.data.value);

  const [index, setIndex] = useState(1);
  const handlers = useRef();

  return (
    <Group spacing={5} position="center">
      <ActionIcon
        size={36}
        variant="filled"
        disabled={!data.length}
        onClick={() => handlers.current.decrement()}
      >
        <IconChevronLeft />
      </ActionIcon>

      <NumberInput
        hideControls
        value={index}
        onChange={(val) =>
          setIndex(
            Math.min(Math.max(Number.isNaN(val) ? 1 : val, 1), data.length)
          )
        }
        handlersRef={handlers}
        step={1}
        min={1}
        max={100}
        disabled={!data.length}
        styles={{ input: { width: 54, height: 36, textAlign: "center" } }}
      />

      <ActionIcon
        size={36}
        variant="filled"
        disabled={!data.length}
        onClick={() => handlers.current.increment()}
      >
        <IconChevronRight />
      </ActionIcon>
    </Group>
  );
}

/** Right
 *
 * @returns
 */
function Layer() {
  // Provider
  const dispatch = useDispatch();
  const layer = useSelector((state) => state.draw.layer);

  const { classes, cx } = createStyles((theme) => ({
    item: {
      marginBottom: 2,
      fontSize: 12,
      borderRadius: theme.radius.sm,
      border: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[4]
      }`,
      padding: 2,
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.white,
    },

    itemDragging: {
      boxShadow: theme.shadows.sm,
    },

    dragHandle: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingRight: 4,
      cursor: "grab",
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[6],
    },
  }))();
  const items = layer.map((item, index) => (
    <Draggable key={`layer-${item.name}`} draggableId={item.name} index={index}>
      {(provided, snapshot) => (
        <Group
          spacing={4}
          className={cx(classes.item, {
            [classes.itemDragging]: snapshot.isDragging,
          })}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div {...provided.dragHandleProps} className={classes.dragHandle}>
            <IconGripVertical size={16} />
          </div>
          <Text size="xs">{item.name}</Text>
          <Group
            size="xs"
            sx={(theme) => {
              return {
                width: 18,
                height: 18,
                marginLeft: "auto",
                alignContent: "center",
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.gray[7]
                    : theme.colors.gray[4],
              };
            }}
          >
            {typeToIcon(item.type)}
          </Group>
          <ActionIcon
            size="xs"
            onClick={() => {
              let tempLayer = [...layer];
              tempLayer.splice(index, 1);
              dispatch(setLayer(tempLayer));
            }}
          >
            <IconX />
          </ActionIcon>
        </Group>
      )}
    </Draggable>
  ));

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        if (!destination) return;
        let tempLayer = [...layer];

        tempLayer.splice(
          destination?.index || 0,
          0,
          tempLayer.splice(source.index, 1)[0]
        );
        dispatch(setLayer(tempLayer));
      }}
    >
      <Droppable droppableId="layer" direction="vertical">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {items}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
function Detail() {
  return <></>;
}

export default function Design() {
  return (
    <Grid m={0} p="sm">
      <Grid.Col md={2} p="sm">
        <Stack spacing={0}>
          <Title order={6} align="center">
            Layout Size
          </Title>
          <Divider my="sm" />
          <LayoutSize />
        </Stack>
        <Stack spacing={0} mt={48}>
          <Title order={6} align="center">
            Variable
          </Title>
          <Divider my="sm" />
          <Variable />
        </Stack>
      </Grid.Col>
      <Grid.Col md={8} p="sm">
        <Stack align="center" spacing="xs">
          <Tool />
          <Canvas />
          <Pagenation />
        </Stack>
      </Grid.Col>
      <Grid.Col md={2} p="sm">
        <Stack spacing={0}>
          <Title order={6} align="center">
            Layer
          </Title>
          <Divider my="sm" />
          <Layer />
        </Stack>
        <Stack spacing={0} mt={48}>
          <Title order={6} align="center">
            Detail
          </Title>
          <Divider my="sm" />
          <Detail />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
