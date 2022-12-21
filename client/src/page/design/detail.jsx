import {
  Grid,
  Group,
  NumberInput,
  Stack,
  ActionIcon,
  Select,
  TextInput,
  ColorInput,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconTypography,
  IconCheck,
  IconLetterX,
  IconLetterY,
  IconLetterW,
  IconLetterH,
  IconHash,
  IconBrush,
  IconBucketDroplet,
  IconHexagonLetterH,
  IconHexagonLetterR,
  IconHexagonLetterX,
  IconBorderStyle2,
  IconBorderStyle,
  IconLink,
  IconLinkOff,
  IconTextSize,
  IconItalic,
  IconBorderOuter,
  IconLayout2,
  IconExternalLink,
  IconFolder,
  IconArrowAutofitWidth,
  IconArrowAutofitHeight,
} from "@tabler/icons";
import {
  TYPE,
  DETAIL_ICON_SIZE,
  convertSize,
  setLayerSize,
  setRename,
  renameLayer,
  setLayerBorderColor,
  setLayerBackColor,
  setLayerFontColor,
  setLayerBorder,
  setLayerFont,
  getLayerSize,
} from "./drawSlice";
import { UNIT } from "../calibrate/paperSlice";
import React from "react";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import WebFont from "webfontloader";

const nextColorFormat = (color) => {
  if (color.format === "rgba") return "hsla";
  else if (
    color.format === "hsla" &&
    (!color.value || !color.value.includes("0."))
  )
    return "hex";
  else return "rgba";
};

function CustomColorInput({ placeholder, selected, color, action, icon }) {
  // Provider
  const dispatch = useDispatch();

  return (
    <ColorInput
      placeholder={placeholder}
      size="xs"
      transitionDuration={100}
      transition="pop-top-left"
      transitionTimingFunction="ease"
      value={color.value}
      format={color.format}
      onChange={(value) =>
        dispatch(
          action({
            index: selected,
            color: { ...color, value },
          })
        )
      }
      rightSection={
        <>
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
            {icon}
          </Group>
          <ActionIcon
            mr="xs"
            variant="transparent"
            onClick={() =>
              dispatch(
                action({
                  index: selected,
                  color: {
                    ...color,
                    format: nextColorFormat(color),
                  },
                })
              )
            }
          >
            {color.format === "rgba" ? (
              <IconHexagonLetterR size={DETAIL_ICON_SIZE + 2} />
            ) : color.format === "hsla" ? (
              <IconHexagonLetterH size={DETAIL_ICON_SIZE + 2} />
            ) : (
              <IconHexagonLetterX size={DETAIL_ICON_SIZE + 2} />
            )}
          </ActionIcon>
        </>
      }
    />
  );
}
export function Detail() {
  // Provider
  const dispatch = useDispatch();
  const layoutPx = convertSize(
    useSelector((state) => state.draw.layout),
    UNIT.px
  );
  const layer = useSelector((state) => state.draw.layer);
  const selected = useSelector((state) => state.draw.selected);
  const rename = useSelector((state) => state.draw.rename);

  const [linkSize, setLinkSize] = useState(true);
  const [fontRename, setFontRename] = useState({ index: -1, value: "" });
  const [fontLoad, setFontLoad] = useState(false);
  const [fontError, setFontError] = useState(false);

  const borderColor =
    selected !== -1 && layer[selected].border?.color
      ? layer[selected].border.color
      : {};
  const backColor =
    selected !== -1 && layer[selected].background?.color
      ? layer[selected].background.color
      : {};
  const fontColor =
    selected !== -1 && layer[selected].font?.color
      ? layer[selected].font.color
      : {};

  return (
    selected !== -1 && (
      <Grid sx={{ width: "100%" }} justify="center" mt="xl" gutter="xl">
        <Grid.Col md={4}>
          <Center pb="md">
            <IconLayout2 size={DETAIL_ICON_SIZE * 3} />
          </Center>
          <Stack spacing={2}>
            <Group noWrap spacing="xs" align="flex-start">
              <TextInput
                placeholder="Layer name"
                sx={{ flex: 1 }}
                size="xs"
                icon={<IconHash size={DETAIL_ICON_SIZE} />}
                value={rename.value}
                error={rename.error.length ? rename.error : false}
                onClick={(event) =>
                  dispatch(
                    setRename({ value: event.currentTarget.value, error: "" })
                  )
                }
                onChange={(event) =>
                  dispatch(
                    setRename({ value: event.currentTarget.value, error: "" })
                  )
                }
              />
              <ActionIcon
                variant=""
                size="md"
                color="blue.6"
                disabled={
                  rename.value === "" ||
                  layer.some((o) => o.name === rename.value)
                }
                onClick={() => {
                  if (
                    layer.some(
                      (o, i) => o.name === rename.value && i !== selected
                    )
                  ) {
                    dispatch(
                      setRename({ value: rename.value, error: "Duplicated" })
                    );
                  } else {
                    showNotification({
                      title: "Layer Name Changed",
                      message: `${layer[selected].name} to ${rename.value}`,
                      color: "green",
                    });
                    dispatch(
                      renameLayer({ index: selected, name: rename.value })
                    );
                  }
                }}
              >
                <IconCheck size={18} />
              </ActionIcon>
            </Group>
            <NumberInput
              size="xs"
              icon={<IconLetterX size={DETAIL_ICON_SIZE} />}
              min={0}
              max={layoutPx.w - getLayerSize(layer[selected], layoutPx.ratio).w}
              value={layer[selected].size.x}
              onChange={(value) => {
                if (value === null) return;
                dispatch(
                  setLayerSize({
                    index: selected,
                    size: {
                      ...layer[selected].size,
                      x: Math.max(
                        0,
                        Math.min(
                          layoutPx.w -
                            getLayerSize(layer[selected], layoutPx.ratio).w,
                          value
                        )
                      ),
                    },
                  })
                );
              }}
            />
            <NumberInput
              size="xs"
              icon={<IconLetterY size={DETAIL_ICON_SIZE} />}
              min={0}
              max={layoutPx.h - getLayerSize(layer[selected], layoutPx.ratio).h}
              value={layer[selected].size.y}
              onChange={(value) => {
                if (value === null) return;
                dispatch(
                  setLayerSize({
                    index: selected,
                    size: {
                      ...layer[selected].size,
                      y: Math.max(
                        0,
                        Math.min(
                          layoutPx.h -
                            getLayerSize(layer[selected], layoutPx.ratio).h,
                          value
                        )
                      ),
                    },
                  })
                );
              }}
            />
            <NumberInput
              size="xs"
              icon={<IconLetterW size={DETAIL_ICON_SIZE} />}
              min={layer[selected].type === TYPE.qr ? 18 : 1}
              value={getLayerSize(layer[selected], layoutPx.ratio).w}
              disabled={[TYPE.text, TYPE.bar].includes(layer[selected].type)}
              onChange={(value) => {
                if (
                  !value ||
                  value < (layer[selected].type === TYPE.qr ? 18 : 1)
                )
                  return;
                dispatch(
                  setLayerSize({
                    index: selected,
                    size:
                      layer[selected].type === TYPE.image && linkSize
                        ? {
                            ...layer[selected].size,
                            w: value,
                            h: Math.ceil(
                              (value / layer[selected].size.nw) *
                                layer[selected].size.nh
                            ),
                          }
                        : { ...layer[selected].size, w: value },
                  })
                );
              }}
            />
            {layer[selected].type === TYPE.image && (
              <ActionIcon
                variant="subtle"
                size="md"
                onClick={() => setLinkSize(!linkSize)}
              >
                {linkSize ? (
                  <IconLink size={DETAIL_ICON_SIZE} />
                ) : (
                  <IconLinkOff size={DETAIL_ICON_SIZE} />
                )}
              </ActionIcon>
            )}
            <NumberInput
              size="xs"
              icon={<IconLetterH size={DETAIL_ICON_SIZE} />}
              min={[TYPE.bar, TYPE.qr].includes(layer[selected].type) ? 18 : 1}
              value={getLayerSize(layer[selected], layoutPx.ratio).h}
              disabled={[TYPE.text, TYPE.qr].includes(layer[selected].type)}
              onChange={(value) => {
                if (
                  !value ||
                  value < (layer[selected].type === TYPE.qr ? 18 : 1)
                )
                  return;
                dispatch(
                  setLayerSize({
                    index: selected,
                    size:
                      layer[selected].type === TYPE.image && linkSize
                        ? {
                            ...layer[selected].size,
                            w: Math.floor(
                              (value / layer[selected].size.nh) *
                                layer[selected].size.nw
                            ),
                            h: value,
                          }
                        : { ...layer[selected].size, h: value },
                  })
                );
              }}
            />
          </Stack>
        </Grid.Col>
        {layer[selected].type !== TYPE.image && (
          <Grid.Col md={4}>
            <Center pb="md">
              <IconBorderOuter size={DETAIL_ICON_SIZE * 3} />
            </Center>
            <Stack spacing={2}>
              <Select
                placeholder="Border style"
                size="xs"
                transitionDuration={100}
                transition="pop-top-left"
                transitionTimingFunction="ease"
                icon={<IconBorderStyle2 size={DETAIL_ICON_SIZE} />}
                clearable
                data={[
                  { value: "solid", label: "solid" },
                  { value: "dashed", label: "dashed" },
                  { value: "dotted", label: "dotted" },
                  { value: "double", label: "double" },
                  { value: "groove", label: "groove" },
                  { value: "ridge", label: "ridge" },
                  { value: "inset", label: "inset" },
                  { value: "outset", label: "outset" },
                ]}
                value={layer[selected].border?.style}
                onChange={(value) =>
                  dispatch(
                    setLayerBorder({
                      index: selected,
                      border: value
                        ? {
                            style: value,
                            width: layer[selected].border?.width ?? 1,
                            color: layer[selected].border?.color,
                          }
                        : {},
                    })
                  )
                }
              />
              <NumberInput
                placeholder="Border width"
                size="xs"
                icon={<IconBorderStyle size={DETAIL_ICON_SIZE} />}
                min={1}
                max={(() => {
                  const size = getLayerSize(layer[selected], layoutPx.ratio);
                  return Math.min(size.w, size.h) / 2 - 1;
                })()}
                value={layer[selected].border?.width}
                onChange={(value) =>
                  dispatch(
                    setLayerBorder({
                      index: selected,
                      border: { ...layer[selected].border, width: value },
                    })
                  )
                }
              />
              <CustomColorInput
                placeholder="Border color"
                selected={selected}
                color={borderColor}
                action={setLayerBorderColor}
                icon={<IconBrush size={DETAIL_ICON_SIZE} />}
              />

              {![TYPE.qr, TYPE.image].includes(layer[selected].type) && (
                <CustomColorInput
                  placeholder="Background color"
                  selected={selected}
                  color={backColor}
                  action={setLayerBackColor}
                  icon={<IconBucketDroplet size={DETAIL_ICON_SIZE} />}
                />
              )}
            </Stack>
          </Grid.Col>
        )}
        {layer[selected].type === TYPE.text && (
          <Grid.Col md={4}>
            <Center pb="md">
              <IconTypography size={DETAIL_ICON_SIZE * 3} />
            </Center>
            <Stack spacing={2}>
              <Group noWrap spacing="xs" align="flex-start">
                <TextInput
                  sx={{ flex: 1 }}
                  size="xs"
                  error={fontError}
                  disabled={fontLoad}
                  placeholder="Get google font"
                  icon={<IconTypography size={DETAIL_ICON_SIZE} />}
                  rightSectionWidth={28 * 2}
                  rightSection={
                    <>
                      <ActionIcon variant="transparent" onClick={() => {}}>
                        <IconFolder size={DETAIL_ICON_SIZE} strokeWidth={3} />
                      </ActionIcon>
                      <ActionIcon
                        variant="transparent"
                        component="a"
                        href="https://fonts.google.com"
                        target="_blank"
                      >
                        <IconExternalLink
                          size={DETAIL_ICON_SIZE}
                          strokeWidth={3}
                        />
                      </ActionIcon>
                    </>
                  }
                  value={
                    selected === fontRename.index
                      ? fontRename.value
                      : layer[selected].font?.family
                      ? layer[selected].font.family
                      : ""
                  }
                  onMouseDown={() => setFontError(false)}
                  onChange={(event) => {
                    setFontError(false);
                    setFontRename({
                      index: selected,
                      value: event.target.value,
                    });
                  }}
                />
                <ActionIcon
                  variant=""
                  size="md"
                  color={fontError ? "red.6" : "blue.6"}
                  disabled={fontLoad}
                  onClick={() => {
                    WebFont.load({
                      google: {
                        families: [fontRename.value],
                      },
                      loading: () => {
                        setFontLoad(true);
                        setFontError(false);
                      },
                      active: () => {
                        setFontLoad(false);
                        dispatch(
                          setLayerFont({
                            index: selected,
                            font: {
                              ...layer[selected].font,
                              family: fontRename.value,
                            },
                          })
                        );
                      },
                      inactive: () => {
                        setFontLoad(false);
                        setFontError(true);
                      },
                    });
                  }}
                >
                  {fontLoad ? <Loader size={18} /> : <IconCheck size={18} />}
                </ActionIcon>
              </Group>
              <Select
                size="xs"
                placeholder="Font weight"
                icon={<IconLetterW size={DETAIL_ICON_SIZE} />}
                data={[
                  { value: 100, label: "100" },
                  { value: 200, label: "200" },
                  { value: 300, label: "300" },
                  { value: 400, label: "400 (normal)" },
                  { value: 500, label: "500" },
                  { value: 600, label: "600" },
                  { value: 700, label: "700 (bold)" },
                  { value: 800, label: "800" },
                  { value: 900, label: "900" },
                ]}
                value={layer[selected].font?.weight}
                onChange={(value) =>
                  dispatch(
                    setLayerFont({
                      index: selected,
                      font: { ...layer[selected].font, weight: value },
                    })
                  )
                }
              />
              <NumberInput
                size="xs"
                placeholder="Font size"
                icon={<IconTextSize size={DETAIL_ICON_SIZE} />}
                min={1}
                value={layer[selected].font?.size}
                onChange={(value) => {
                  if (!value) return;

                  dispatch(
                    setLayerFont({
                      index: selected,
                      font: {
                        ...layer[selected].font,
                        size: value,
                      },
                    })
                  );
                }}
              />
              <Group noWrap spacing="xs" align="flex-start">
                <CustomColorInput
                  sx={{ flex: 1 }}
                  placeholder="Font color"
                  selected={selected}
                  color={fontColor}
                  action={setLayerFontColor}
                  icon={<IconTypography size={DETAIL_ICON_SIZE} />}
                />
                <ActionIcon
                  size="md"
                  variant={
                    layer[selected].font?.style === "italic"
                      ? "filled"
                      : "outline"
                  }
                  onClick={() =>
                    dispatch(
                      setLayerFont({
                        index: selected,
                        font: {
                          ...layer[selected].font,
                          style:
                            layer[selected].font?.style === "italic"
                              ? ""
                              : "italic",
                        },
                      })
                    )
                  }
                >
                  <IconItalic size={DETAIL_ICON_SIZE} />
                </ActionIcon>
              </Group>

              <NumberInput
                size="xs"
                placeholder="Horizontal Scale"
                icon={<IconArrowAutofitWidth size={DETAIL_ICON_SIZE} />}
                precision={2}
                min={0}
                step={0.01}
                value={layer[selected].font?.scale?.w ?? 1}
                onChange={(value) => {
                  if (!value) return;

                  dispatch(
                    setLayerFont({
                      index: selected,
                      font: {
                        ...layer[selected].font,
                        scale: { ...layer[selected].font.scale, w: value },
                      },
                    })
                  );
                }}
              />
              <NumberInput
                size="xs"
                placeholder="Vertical Scale"
                icon={<IconArrowAutofitHeight size={DETAIL_ICON_SIZE} />}
                precision={2}
                min={0}
                step={0.01}
                value={layer[selected].font?.scale?.h ?? 1}
                onChange={(value) => {
                  if (!value) return;

                  dispatch(
                    setLayerFont({
                      index: selected,
                      font: {
                        ...layer[selected].font,
                        scale: { ...layer[selected].font.scale, h: value },
                      },
                    })
                  );
                }}
              />
            </Stack>
          </Grid.Col>
        )}
      </Grid>
    )
  );
}
