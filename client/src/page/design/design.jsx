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
  Input,
  TextInput,
} from "@mantine/core";
import React, { useEffect, useRef } from "react";
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
  IconCheck,
  IconLetterX,
  IconLetterY,
  IconLetterW,
  IconLetterH,
  IconHash,
  IconAlphabetLatin,
} from "@tabler/icons";
import {
  setSize,
  setSizeRatio,
  addLayer,
  changeLayerIndex,
  removeLayerByIndex,
  setLayerSize,
  setSelected,
  setVar,
} from "./drawSlice";

const UNIT = { inch: "inch", cm: "cm", px: "px" };
const TYPE = {
  rect: "rect",
  circle: "circle",
  text: "text",
  image: "image",
  qr: "qr",
};
const DETAIL_ICON_SIZE = 14;

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
          label={(val) => (1 + val) * 100 + "%"}
          defaultValue={0}
          min={0}
          max={2}
          step={0.5}
          marks={[
            { value: 0 },
            { value: 0.5 },
            { value: 1 },
            { value: 1.5 },
            { value: 2 },
          ]}
          styles={{ markLabel: { display: "none" } }}
          onChange={(value) => {
            dispatch(setSizeRatio(1 + value));
          }}
        />
      </Grid.Col>
    </Grid>
  );
}
function Variable() {
  // Provider
  const dispatch = useDispatch();
  const selected = useSelector((state) => state.draw.selected);
  const layer = useSelector((state) => state.draw.layer);

  if (selected === -1) return <></>;

  switch (layer[selected].type) {
    case TYPE.text:
      return (
        <Grid>
          <Grid.Col>
            <TextInput
              placeholder="Default Value"
              size="xs"
              icon={<IconAlphabetLatin size={DETAIL_ICON_SIZE} />}
              value={layer[selected].var.default}
              onChange={(event) => {
                dispatch(
                  setVar({
                    index: selected,
                    var: {
                      ...layer[selected].var,
                      default: event.currentTarget.value,
                    },
                  })
                );
              }}
            />
          </Grid.Col>
        </Grid>
      );
    case TYPE.image:
      return <></>;
    default:
      return <></>;
  }
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
          onClick={() =>
            dispatch(
              addLayer({
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
              })
            )
          }
        >
          <IconSquare />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Circle">
        <ActionIcon
          variant="subtle"
          onClick={() =>
            dispatch(
              addLayer({
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
              })
            )
          }
        >
          <IconCircle />
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />
      <Tooltip label="Text">
        <ActionIcon
          variant="subtle"
          onClick={() => {
            dispatch(
              addLayer({
                name: getLayerName(),
                type: TYPE.text,
                size: {
                  x: sizePx.w / 2 - 10,
                  y: sizePx.h / 2 - 10,
                },
                var: { default: "New Text" },
              })
            );
          }}
        >
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
  let selected = useSelector((state) => state.draw.selected);

  const refCanvas = useRef();
  const refLayer = useRef({ current: [] });
  let [move, setMove] = useState({ x: -1, y: -1, ox: 0, oy: 0 });

  const selectedLayerSize = () => {
    if (layer[selected].type === TYPE.text) {
      const textElement = document.getElementById(
        `canvas-${layer[selected].name}`
      );
      return {
        ...layer[selected].size,
        w: textElement ? Math.ceil(textElement.offsetWidth / sizePx.ratio) : 0,
        h: textElement ? Math.ceil(textElement.offsetHeight / sizePx.ratio) : 0,
      };
    } else return layer[selected].size;
  };

  const onMouseMove = (event) => {
    event.preventDefault();

    setMove(
      (move = {
        ...move,
        x: Math.round(
          Math.max(
            0,
            Math.min(
              (sizePx.w - selectedLayerSize().w) * sizePx.ratio - 2,
              event.pageX - refCanvas.current.offsetLeft - move.ox
            )
          ) / sizePx.ratio
        ),
        y: Math.round(
          Math.max(
            0,
            Math.min(
              (sizePx.h - selectedLayerSize().h) * sizePx.ratio - 2,
              event.pageY - refCanvas.current.offsetTop - move.oy
            )
          ) / sizePx.ratio
        ),
      })
    );
  };
  const onMouseDown = (event, index) => {
    event.preventDefault();
    event.stopPropagation();

    dispatch(setSelected((selected = index)));
    setMove(
      (move = {
        x: layer[index].size.x,
        y: layer[index].size.y,
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
      event.preventDefault();

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
            x: Math.max(0, Math.min(sizePx.w - l.size.w - 1, l.size.x + d.x)),
            y: Math.max(0, Math.min(sizePx.h - l.size.h - 1, l.size.y + d.y)),
          },
        })
      );
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch, layer, selected, sizePx]);

  const items = layer.map((_, i) => {
    const index = layer.length - 1 - i;
    const item = layer[index];

    let defaultStyle = {
      position: "absolute",
      left: item.size.x * sizePx.ratio,
      top: item.size.y * sizePx.ratio,
    };
    // If item is moving, set location to mouse postion
    if (move.x !== -1 && index === selected)
      defaultStyle = {
        ...defaultStyle,
        left: move.x * sizePx.ratio,
        top: move.y * sizePx.ratio,
      };

    switch (item.type) {
      case TYPE.rect:
      case TYPE.circle:
        return (
          <div
            key={`canvas-${item.name}`}
            ref={(el) => (refLayer.current[index] = el)}
            onMouseDown={(event) => onMouseDown(event, index)}
            style={{
              ...defaultStyle,

              width: item.size.w * sizePx.ratio,
              height: item.size.h * sizePx.ratio,

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
            ref={(el) => (refLayer.current[index] = el)}
            onMouseDown={(event) => onMouseDown(event, index)}
            style={{
              ...defaultStyle,

              WebkitUserSelect: "none" /* Safari */,
              msUserSelect: "none" /* IE 10 and IE 11 */,
              userSelect: "none" /* Standard syntax */,

              fontFamily: item.font?.family,
              fontSize: item.font ? item.font.size * sizePx.ratio : null,
              color: item.font?.color,

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
                ? layer[selected].size.x * sizePx.ratio - 1
                : move.x * sizePx.ratio - 1,
            top:
              move.y === -1
                ? layer[selected].size.y * sizePx.ratio - 1
                : move.y * sizePx.ratio - 1,
            width: selectedLayerSize().w * sizePx.ratio + 2,
            height: selectedLayerSize().h * sizePx.ratio + 2,

            backgroundImage:
              "repeating-linear-gradient(0deg, #0000ff, #0000ff 4px, transparent 4px, transparent 8px, #0000ff 8px), repeating-linear-gradient(90deg, #0000ff, #0000ff 4px, transparent 4px, transparent 8px, #0000ff 8px), repeating-linear-gradient(180deg, #0000ff, #0000ff 4px, transparent 4px, transparent 8px, #0000ff 8px), repeating-linear-gradient(270deg, #0000ff, #0000ff 4px, transparent 4px, transparent 8px, #0000ff 8px)",
            backgroundSize:
              "1px calc(100% + 8px), calc(100% + 8px) 1px, 1px calc(100% + 8px) , calc(100% + 8px) 1px",
            backgroundPosition: " 0 0, 0 0, 100% 0, 0 100%",
            backgroundRepeat: "no-repeat",
            animation: "borderAnimation 0.4s infinite linear",
          }}
        ></div>
      )}
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
  const selected = useSelector((state) => state.draw.selected);

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

    isSelected: {
      borderColor: theme.colors.blue[6],
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
          sx={(theme) => {
            return {
              borderColor: index === selected ? theme.colors.blue[6] : "",
            };
          }}
          className={cx(classes.item, {
            [classes.itemDragging]: snapshot.isDragging,
          })}
          onClick={() => dispatch(setSelected(index))}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div {...provided.dragHandleProps} className={classes.dragHandle}>
            <IconGripVertical size={16} />
          </div>
          <Text size="xs" style={{ cursor: "default" }}>
            {item.name}
          </Text>
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
            onClick={(event) => {
              event.stopPropagation();
              dispatch(removeLayerByIndex(index));
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
        dispatch(
          changeLayerIndex({ from: source.index, to: destination.index })
        );

        // Change selected index when selected element move
        if (selected === source.index) dispatch(setSelected(destination.index));
        // Change selected index when other move
        else if (source.index < selected && destination.index >= selected)
          dispatch(setSelected(selected - 1));
        else if (source.index > selected && destination.index <= selected)
          dispatch(setSelected(selected + 1));
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
  // Provider
  const dispatch = useDispatch();
  const sizePx = convertSize.px(useSelector((state) => state.draw.size));
  const selected = useSelector((state) => state.draw.selected);
  const layer = useSelector((state) => state.draw.layer);

  const selectedLayerSize = () => {
    if (layer[selected].type === TYPE.text) {
      const textElement = document.getElementById(
        `canvas-${layer[selected].name}`
      );
      return {
        ...layer[selected].size,
        w: textElement ? Math.ceil(textElement.offsetWidth / sizePx.ratio) : 0,
        h: textElement ? Math.ceil(textElement.offsetHeight / sizePx.ratio) : 0,
      };
    } else return layer[selected].size;
  };

  return (
    selected !== -1 && (
      <Grid>
        <Grid.Col>
          <Group noWrap spacing="xs">
            <Input
              placeholder="Layer Name"
              sx={{ flex: 1 }}
              size="xs"
              icon={<IconHash size={DETAIL_ICON_SIZE} />}
              value={layer[selected].name}
              onChange={() => {}}
            />
            <ActionIcon variant="" size="md">
              <IconCheck size={18} />
            </ActionIcon>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            size="xs"
            icon={<IconLetterX size={DETAIL_ICON_SIZE} />}
            value={layer[selected].size.x}
            onChange={(value) =>
              dispatch(
                setLayerSize({
                  index: selected,
                  size: {
                    ...layer[selected].size,
                    x: value,
                  },
                })
              )
            }
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            size="xs"
            icon={<IconLetterY size={DETAIL_ICON_SIZE} />}
            value={layer[selected].size.y}
            onChange={(value) =>
              dispatch(
                setLayerSize({
                  index: selected,
                  size: {
                    ...layer[selected].size,
                    y: value,
                  },
                })
              )
            }
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            size="xs"
            icon={<IconLetterW size={DETAIL_ICON_SIZE} />}
            value={selectedLayerSize().w}
            disabled={layer[selected].type === TYPE.text}
            onChange={(value) =>
              dispatch(
                setLayerSize({
                  index: selected,
                  size: {
                    ...layer[selected].size,
                    w: value,
                  },
                })
              )
            }
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            size="xs"
            icon={<IconLetterH size={DETAIL_ICON_SIZE} />}
            value={selectedLayerSize().h}
            disabled={layer[selected].type === TYPE.text}
            onChange={(value) =>
              dispatch(
                setLayerSize({
                  index: selected,
                  size: {
                    ...layer[selected].size,
                    h: value,
                  },
                })
              )
            }
          />
        </Grid.Col>
      </Grid>
    )
  );
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
