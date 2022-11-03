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
  TextInput,
  SegmentedControl,
  ColorInput,
  FileButton,
  Button,
  Image as ManImage,
} from "@mantine/core";
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
  IconRuler3,
  IconVariable,
  IconBrush,
  IconBucketDroplet,
  IconHexagonLetterH,
  IconHexagonLetterR,
  IconHexagonLetterX,
  IconBorderStyle2,
  IconBorderStyle,
  IconLink,
  IconLinkOff,
} from "@tabler/icons";
import {
  setSize,
  setSizeRatio,
  addLayer,
  changeLayerIndex,
  removeLayerByIndex,
  setLayerSize,
  setSelected,
  setLayerVar,
  setPage,
  setRename,
  renameLayer,
  setLayerBorderColor,
  setLayerBackColor,
  setLayerFontColor,
  setLayerBorder,
  setLayerVarImg,
} from "./drawSlice";
import React, { useRef } from "react";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { QRCodeSVG } from "qrcode.react";
import { saveAs } from "file-saver";

const UNIT = { inch: "inch", cm: "cm", px: "px" };
const TYPE = {
  rect: "rect",
  circle: "circle",
  text: "text",
  image: "image",
  qr: "qr",
};
const DETAIL_ICON_SIZE = 14;
const MAX_FILE_SIZE = 5 * 1024 ** 2;

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
const nextColorFormat = (color) => {
  if (color.format === "rgba") return "hsla";
  else if (
    color.format === "hsla" &&
    (!color.value || !color.value.includes("0."))
  )
    return "hex";
  else return "rgba";
};
const mimeToExt = {
  "image/avif": ".avi",
  "image/bmp": ".bmp",
  "image/gif": ".gif",
  "image/vnd.microsoft.icon": ".ico",
  "image/jpeg": ".jpeg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/tiff": ".tiff",
  "image/webp": ".webp",
};

// Left
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
          icon={<IconRuler3 size={DETAIL_ICON_SIZE} />}
          size="xs"
          transitionDuration={100}
          transition="pop-top-left"
          transitionTimingFunction="ease"
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
  const data = useSelector((state) => state.data.value);
  const sizePx = convertSize.px(useSelector((state) => state.draw.size));
  const layer = useSelector((state) => state.draw.layer);
  const selected = useSelector((state) => state.draw.selected);

  if (selected === -1) return <></>;

  switch (layer[selected].type) {
    case TYPE.text:
      return (
        <>
          <Title order={6} align="center">
            Variable
          </Title>
          <Divider my="sm" />
          <Grid>
            <Grid.Col>
              <SegmentedControl
                fullWidth
                color="blue"
                size="xs"
                data={[
                  { value: "static", label: "Static" },
                  { value: "format", label: "Format" },
                ]}
                value={layer[selected].var.type}
                onChange={(value) =>
                  dispatch(
                    setLayerVar({
                      index: selected,
                      var: { ...layer[selected].var, type: value },
                    })
                  )
                }
              />
            </Grid.Col>
            <Grid.Col>
              {layer[selected].var.type === "static" && (
                <TextInput
                  placeholder="Static Text"
                  size="xs"
                  icon={<IconAlphabetLatin size={DETAIL_ICON_SIZE} />}
                  value={layer[selected].var.static}
                  onChange={(event) => {
                    dispatch(
                      setLayerVar({
                        index: selected,
                        var: {
                          ...layer[selected].var,
                          static: event.currentTarget.value,
                        },
                      })
                    );
                  }}
                />
              )}
              {layer[selected].var.type === "format" && (
                <Select
                  placeholder="Data Column"
                  size="xs"
                  transitionDuration={100}
                  transition="pop-top-left"
                  transitionTimingFunction="ease"
                  icon={<IconVariable size={DETAIL_ICON_SIZE} />}
                  data={Object.keys(data.length ? data[0] : []).map((s) => {
                    return { value: s, label: s };
                  })}
                  value={layer[selected].var.format}
                  onChange={(value) => {
                    if (value === layer[selected].var.format) return;
                    dispatch(
                      setLayerVar({
                        index: selected,
                        var: {
                          ...layer[selected].var,
                          format: value,
                        },
                      })
                    );
                  }}
                />
              )}
            </Grid.Col>
          </Grid>
        </>
      );
    case TYPE.image:
      return (
        <>
          <Title order={6} align="center">
            Variable
          </Title>
          <Divider my="sm" />
          <Grid>
            <Grid.Col>
              <FileButton
                sx={(theme) => {
                  return {
                    width: "100%",
                    background:
                      theme.colorScheme === "dark" ? "#2C2E33" : "#fff",
                  };
                }}
                accept="image/*"
                onChange={(file) => {
                  // Empty
                  if (!file) return;

                  // No image type
                  if (!file.type.startsWith("image/")) {
                    showNotification({
                      title: "Unsupported file type",
                      message: "File type must be one of (png, jpg, svg, ...)",
                      color: "red",
                    });
                    return;
                  }

                  // Exceed file size
                  if (file.size > MAX_FILE_SIZE) {
                    showNotification({
                      title: "Too large file",
                      message: "File size exceed 5mb",
                      color: "red",
                    });
                    return;
                  }

                  const url = URL.createObjectURL(file);
                  const img = new Image();
                  img.onload = () => {
                    const wRatio = sizePx.w / img.width;
                    const hRatio = sizePx.h / img.height;
                    const w = Math.floor(Math.min(wRatio, hRatio) * img.width);
                    const h = Math.floor(Math.min(wRatio, hRatio) * img.height);

                    dispatch(
                      setLayerVar({
                        index: selected,
                        var: { ...layer[selected].var, default: url },
                      })
                    );

                    dispatch(
                      setLayerSize({
                        index: selected,
                        size: {
                          ...layer[selected].size,
                          x: sizePx.w / 2 - w / 2,
                          y: sizePx.h / 2 - h / 2,
                          w,
                          h,
                          nw: w,
                          nh: h,
                        },
                      })
                    );
                  };

                  img.src = url;
                }}
              >
                {(props) => (
                  <Button
                    compact
                    size="xs"
                    variant="default"
                    rightIcon={
                      <ManImage
                        height={DETAIL_ICON_SIZE}
                        src={layer[selected].var.default}
                      />
                    }
                    {...props}
                    styles={(theme) => ({
                      root: {
                        fontWeight: 400,
                        color:
                          theme.colorScheme === "dark" ? "#C1C2C5" : "#000",
                      },
                      rightIcon: {
                        marginLeft: "auto",
                      },
                    })}
                  >
                    Default
                  </Button>
                )}
              </FileButton>
            </Grid.Col>
            <Grid.Col>
              <Select
                placeholder="Data Column"
                size="xs"
                clearable
                transitionDuration={100}
                transition="pop-top-left"
                transitionTimingFunction="ease"
                icon={<IconVariable size={DETAIL_ICON_SIZE} />}
                data={Object.keys(data.length ? data[0] : []).map((s) => {
                  return { value: s, label: s };
                })}
                value={layer[selected].var.format}
                onChange={(value) => {
                  let img = {};
                  if (value)
                    new Set(data.map((o) => o[value])).forEach(
                      (v) => (img[v] = "")
                    );

                  dispatch(
                    setLayerVar({
                      index: selected,
                      var: { ...layer[selected].var, format: value, img },
                    })
                  );
                }}
              />
            </Grid.Col>
            {layer[selected].var.format && (
              <Grid.Col>
                <Grid>
                  {Object.keys(layer[selected].var.img)
                    .filter((k) => k !== "")
                    .map((k) => (
                      <Grid.Col key={`variable-${k}`} span={3} md={12} py={0}>
                        <FileButton
                          sx={(theme) => {
                            return {
                              width: "100%",
                              background:
                                theme.colorScheme === "dark"
                                  ? "#2C2E33"
                                  : "#fff",
                            };
                          }}
                          accept="image/*"
                          onChange={(file) => {
                            // Empty
                            if (!file) return;

                            // No image type
                            if (!file.type.startsWith("image/")) {
                              showNotification({
                                title: "Unsupported file type",
                                message:
                                  "File type must be one of (png, jpg, svg, ...)",
                                color: "red",
                              });
                              return;
                            }

                            // Exceed file size
                            if (file.size > MAX_FILE_SIZE) {
                              showNotification({
                                title: "Too large file",
                                message: "File size exceed 5mb",
                                color: "red",
                              });
                              return;
                            }

                            const url = URL.createObjectURL(file);
                            const img = new Image();
                            img.onload = () => {
                              const varImg = { ...layer[selected].var.img };
                              varImg[k] = url;
                              dispatch(
                                setLayerVarImg({
                                  index: selected,
                                  img: varImg,
                                })
                              );
                            };
                            img.src = url;
                          }}
                        >
                          {(props) => (
                            <Button
                              compact
                              size="xs"
                              variant="outline"
                              rightIcon={
                                layer[selected].var.img[k] ? (
                                  <ManImage
                                    height={DETAIL_ICON_SIZE}
                                    src={layer[selected].var.img[k]}
                                  />
                                ) : (
                                  <IconPhoto size={DETAIL_ICON_SIZE} />
                                )
                              }
                              {...props}
                              styles={() => ({
                                root: {
                                  fontWeight: 400,
                                },
                                rightIcon: {
                                  marginLeft: "auto",
                                },
                              })}
                            >
                              {k}
                            </Button>
                          )}
                        </FileButton>
                      </Grid.Col>
                    ))}
                </Grid>
              </Grid.Col>
            )}
          </Grid>
        </>
      );
    default:
      return <></>;
  }
}

// Middle
function Tool() {
  // Provider
  const dispatch = useDispatch();
  const sizePx = convertSize.px(useSelector((state) => state.draw.size));
  const layer = useSelector((state) => state.draw.layer);

  let [layerCount, setLayerCount] = useState(1);
  const prediectLayerName = (o) => o.name === "layer" + layerCount;
  const getNextLayerName = () => {
    while (layer.some(prediectLayerName)) layerCount++;
    setLayerCount(layerCount + 1);
    return "layer" + layerCount;
  };

  return (
    <Group position="center" spacing="xs">
      <FileButton
        sx={() => {
          return { width: 28, height: 28 };
        }}
        accept="application/zip"
        onChange={(file) => {
          // Empty
          if (!file) return;

          require("jszip")()
            .loadAsync(file)
            .then(
              (zip) => {
                // Check layer.json
                if (!zip.files["layer.json"]) {
                  showNotification({
                    title: "No layer.json",
                    message:
                      "There is no layer.json file in the root directory",
                    color: "read",
                  });
                  return;
                }

                zip
                  .file("layer.json")
                  .async("string")
                  .then((strLayer) => console.log(strLayer));
              },
              (err) => {
                console.error(err);
              }
            );
        }}
      >
        {(props) => (
          <Tooltip label="Load" withArrow>
            <Button
              p={0}
              color="gray"
              variant="subtle"
              leftIcon={<IconFolder />}
              styles={() => ({ leftIcon: { marginRight: 0 } })}
              {...props}
            />
          </Tooltip>
        )}
      </FileButton>
      <Tooltip label="Save" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() => {
            // showNotification({
            //   title: "Request saving design project",
            //   message: "please wait just a moment",
            //   color: "yellow",
            // });
            // Archive design project
            (async () => {
              const zip = require("jszip")();
              const copiedLayer = layer.map((l) => {
                if (l.type !== TYPE.image) return l;

                let img = {};
                if (l.var?.img)
                  Object.keys(l.var.img).forEach((key) => (img[key] = ""));

                return { ...l, var: { default: "", img } };
              });
              zip.file("layer.json", JSON.stringify(copiedLayer));

              const imgDir = zip.folder("images");
              await Promise.all(
                layer.map(async (o, i) => {
                  // Only image filter and var
                  if (o.type !== TYPE.image || !o.var) return;

                  // Default image
                  const varDir = imgDir.folder(String(i));
                  if (o.var.default)
                    await fetch(o.var.default)
                      .then((res) => res.blob())
                      .then((blob) =>
                        varDir.file(`default${mimeToExt[blob.type]}`, blob)
                      );

                  // Variable images
                  if (o.var.img) {
                    await Promise.all(
                      Object.keys(o.var.img).map(async (key, j) => {
                        if (o.var.img[key] === "") return;

                        await fetch(o.var.img[key])
                          .then((res) => res.blob())
                          .then((blob) =>
                            varDir.file(`${j}${mimeToExt[blob.type]}`, blob)
                          );
                      })
                    );
                  }
                })
              );
              return zip;
            })().then((zip) => {
              zip.generateAsync({ type: "blob" }).then((content) => {
                // see FileSaver.js
                saveAs(content, "Design - Label Generator.zip");
                showNotification({
                  title: "Saving design project successfully!",
                  message: `File size is ${content.size}`,
                  color: "green",
                });
              });
            });
          }}
        >
          <IconDeviceFloppy />
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />
      <Tooltip label="Rectangle" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() =>
            dispatch(
              addLayer({
                name: getNextLayerName(),
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
      <Tooltip label="Circle" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() =>
            dispatch(
              addLayer({
                name: getNextLayerName(),
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
      <Tooltip label="Text" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() => {
            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.text,
                size: {
                  x: sizePx.w / 2 - 10,
                  y: sizePx.h / 2 - 10,
                },
                var: { type: "static", static: "New Text" },
              })
            );
          }}
        >
          <IconTypography />
        </ActionIcon>
      </Tooltip>

      <FileButton
        sx={() => {
          return { width: 28, height: 28 };
        }}
        accept="image/*"
        onChange={(file) => {
          // Empty
          if (!file) return;

          // No image type
          if (!file.type.startsWith("image/")) {
            showNotification({
              title: "Unsupported file type",
              message: "File type must be one of (png, jpg, svg, ...)",
              color: "red",
            });
            return;
          }

          // Exceed file size
          if (file.size > MAX_FILE_SIZE) {
            showNotification({
              title: "Too large file",
              message: "File size exceed 5mb",
              color: "red",
            });
            return;
          }

          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            const wRatio = sizePx.w / img.width;
            const hRatio = sizePx.h / img.height;
            const w = Math.floor(Math.min(wRatio, hRatio) * img.width);
            const h = Math.floor(Math.min(wRatio, hRatio) * img.height);

            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.image,
                size: {
                  x: sizePx.w / 2 - w / 2,
                  y: sizePx.h / 2 - h / 2,
                  w,
                  h,
                  nw: w,
                  nh: h,
                },
                var: { default: url },
              })
            );
          };
          img.src = url;
        }}
      >
        {(props) => (
          <Tooltip label="Image" withArrow>
            <Button
              p={0}
              color="gray"
              variant="subtle"
              leftIcon={<IconPhoto />}
              styles={() => ({ leftIcon: { marginRight: 0 } })}
              {...props}
            />
          </Tooltip>
        )}
      </FileButton>

      <Tooltip label="QR Code" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() =>
            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.qr,
                size: {
                  x: sizePx.w / 2 - 10,
                  y: sizePx.h / 2 - 10,
                  w: 20,
                },
              })
            )
          }
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
  const data = useSelector((state) => state.data.value);
  const page = useSelector((state) => state.draw.page);
  const format = useSelector((state) => state.qr.format);
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
    } else if (layer[selected].type === TYPE.qr) {
      return {
        ...layer[selected].size,
        h: layer[selected].size.w,
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
              (sizePx.w - selectedLayerSize().w) * sizePx.ratio,
              event.pageX - refCanvas.current.offsetLeft - move.ox
            )
          ) / sizePx.ratio
        ),
        y: Math.round(
          Math.max(
            0,
            Math.min(
              (sizePx.h - selectedLayerSize().h) * sizePx.ratio,
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

  const items = layer.map((_, i) => {
    const index = layer.length - 1 - i;
    const item = layer[index];

    let defaultStyle = {
      position: "absolute",
      left: item.size.x * sizePx.ratio,
      top: item.size.y * sizePx.ratio,

      borderStyle: item.border?.style,
      borderWidth: item.border?.width
        ? item.border?.width * sizePx.ratio
        : null,
      borderColor: item.border?.color?.value,

      background: item.background?.color?.value,
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

              borderRadius: item.type === TYPE.circle ? "50%" : 0,
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
              fontSize:
                item.font && item.font.size
                  ? item.font.size * sizePx.ratio
                  : null,
              color: item.font?.color?.value,
            }}
          >
            {item.var.type === "format"
              ? data.length && Object.keys(data[0]).includes(item.var.format)
                ? data[page][item.var.format]
                : ""
              : item.var.static}
          </Text>
        );
      case TYPE.qr:
        return (
          <div
            key={`canvas-${item.name}`}
            ref={(el) => (refLayer.current[index] = el)}
            onMouseDown={(event) => onMouseDown(event, index)}
            style={defaultStyle}
          >
            <QRCodeSVG
              size={item.size.w * sizePx.ratio}
              value={
                data.length
                  ? format
                      .filter(
                        (o) =>
                          o.literal || Object.keys(data[0]).includes(o.value)
                      )
                      .map((o) => (o.literal ? o.value : data[page][o.value]))
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
              item.var.format &&
              item.var.img &&
              item.var.img[data[page][item.var.format]]
                ? item.var.img[data[page][item.var.format]]
                : item.var.default
            }
            width={item.size.w * sizePx.ratio}
            height={item.size.h * sizePx.ratio}
            key={`canvas-${item.name}`}
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
        width: sizePx.w * sizePx.ratio,
        height: sizePx.h * sizePx.ratio,
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
            backgroundPosition: "0 0, 0 0, 100% 0, 0 100%",
            backgroundRepeat: "no-repeat",
            animation: "borderAnimation 0.4s infinite linear",
          }}
        ></div>
      )}
    </Paper>
  );
}
export function Pagenation() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);
  const page = useSelector((state) => state.draw.page);

  return (
    <Group spacing={5} position="center">
      <ActionIcon
        size={36}
        variant="filled"
        disabled={!data.length}
        onClick={() =>
          dispatch(setPage(Math.min(Math.max(0, page - 1), data.length - 1)))
        }
      >
        <IconChevronLeft />
      </ActionIcon>

      <NumberInput
        hideControls
        value={page + 1}
        step={1}
        min={1}
        max={data.length}
        disabled={!data.length}
        styles={{ input: { width: 54, height: 36, textAlign: "center" } }}
        onChange={(val) =>
          dispatch(
            setPage(val ? Math.min(Math.max(0, val - 1), data.length - 1) : 0)
          )
        }
        onWheel={(event) => {
          const val = Math.min(
            Math.max(0, page - Math.sign(event.deltaY)),
            data.length - 1
          );
          if (page === val) return;

          dispatch(setPage(val));
          event.target.blur();
        }}
      />

      <ActionIcon
        size={36}
        variant="filled"
        disabled={!data.length}
        onClick={() =>
          dispatch(setPage(Math.min(Math.max(0, page + 1), data.length - 1)))
        }
      >
        <IconChevronRight />
      </ActionIcon>
    </Group>
  );
}

// Right
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
function Detail() {
  // Provider
  const dispatch = useDispatch();
  const sizePx = convertSize.px(useSelector((state) => state.draw.size));
  const layer = useSelector((state) => state.draw.layer);
  const selected = useSelector((state) => state.draw.selected);
  const rename = useSelector((state) => state.draw.rename);

  const [linkSize, setLinkSize] = useState(true);
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
    } else if (layer[selected].type === TYPE.qr) {
      return {
        ...layer[selected].size,
        h: layer[selected].size.w,
      };
    } else return layer[selected].size;
  };

  return (
    selected !== -1 && (
      <>
        <Title order={6} align="center">
          Detail
        </Title>
        <Divider my="sm" />
        <Grid>
          <Grid.Col>
            <Group noWrap spacing="xs" align="flex-start">
              <TextInput
                placeholder="Layer Name"
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
                onClick={(event) => {
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
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              size="xs"
              icon={<IconLetterX size={DETAIL_ICON_SIZE} />}
              min={0}
              max={sizePx.w - selectedLayerSize().w}
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
                        Math.min(sizePx.w - selectedLayerSize().w, value)
                      ),
                    },
                  })
                );
              }}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              size="xs"
              icon={<IconLetterY size={DETAIL_ICON_SIZE} />}
              min={0}
              max={sizePx.h - selectedLayerSize().h}
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
                        Math.min(sizePx.h - selectedLayerSize().h, value)
                      ),
                    },
                  })
                );
              }}
            />
          </Grid.Col>
          <Grid.Col>
            <Group
              noWrap
              spacing={layer[selected].type === TYPE.image ? 0 : "md"}
            >
              <NumberInput
                size="xs"
                style={{ flex: 1 }}
                icon={<IconLetterW size={DETAIL_ICON_SIZE} />}
                min={layer[selected].type === TYPE.qr ? 18 : 1}
                value={selectedLayerSize().w}
                disabled={layer[selected].type === TYPE.text}
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
                style={{ flex: 1 }}
                icon={<IconLetterH size={DETAIL_ICON_SIZE} />}
                min={layer[selected].type === TYPE.qr ? 18 : 1}
                value={selectedLayerSize().h}
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
            </Group>
          </Grid.Col>
          {layer[selected].type !== TYPE.image && (
            <>
              <Grid.Col span={4} md={12} pb={1}>
                <Select
                  placeholder="Border Style"
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
                              width: layer[selected].border?.width
                                ? layer[selected].border?.width
                                : 1,
                              color: layer[selected].border?.color,
                            }
                          : {},
                      })
                    )
                  }
                />
              </Grid.Col>
              <Grid.Col span={4} md={12} py={1}>
                <NumberInput
                  placeholder="Border Width"
                  size="xs"
                  icon={<IconBorderStyle size={DETAIL_ICON_SIZE} />}
                  min={1}
                  max={
                    Math.min(selectedLayerSize().w, selectedLayerSize().h) / 2 -
                    1
                  }
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
              </Grid.Col>
              <Grid.Col span={4} md={12} pt={1}>
                <CustomColorInput
                  placeholder="Border Color"
                  selected={selected}
                  color={borderColor}
                  action={setLayerBorderColor}
                  icon={<IconBrush size={DETAIL_ICON_SIZE} />}
                />
              </Grid.Col>
            </>
          )}
          {![TYPE.qr, TYPE.image].includes(layer[selected].type) && (
            <Grid.Col>
              <CustomColorInput
                placeholder="Background Color"
                selected={selected}
                color={backColor}
                action={setLayerBackColor}
                icon={<IconBucketDroplet size={DETAIL_ICON_SIZE} />}
              />
            </Grid.Col>
          )}
          {layer[selected].type === TYPE.text && (
            <Grid.Col>
              <CustomColorInput
                placeholder="Font Color"
                selected={selected}
                color={fontColor}
                action={setLayerFontColor}
                icon={<IconTypography size={DETAIL_ICON_SIZE} />}
              />
            </Grid.Col>
          )}
        </Grid>
      </>
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
          <Detail />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
