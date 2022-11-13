import {
  Group,
  ActionIcon,
  Divider,
  Tooltip,
  FileButton,
  Button,
  Title,
  Text,
} from "@mantine/core";
import {
  IconDeviceFloppy,
  IconFolder,
  IconFile,
  IconInfoCircle,
} from "@tabler/icons";
import {
  TYPE,
  GROUP,
  MAX_FILE_SIZE,
  convertSize,
  typeToIcon,
  setLayout,
  addLayer,
  setLayer,
} from "./drawSlice";
import { UNIT } from "../calibrate/paperSlice";
import React from "react";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveAs } from "file-saver";
import WebFont from "webfontloader";

const DOMAIN = "label.ddsgit.com";

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
const extToMime = {
  ".avi": "image/avif",
  ".bmp": "image/bmp",
  ".gif": "image/gif",
  ".ico": "image/vnd.microsoft.icon",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".tiff": "image/tiff",
  ".webp": "image/webp",
};

export function Tool() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);
  const layout = useSelector((state) => state.draw.layout);
  const layoutPx = convertSize(layout, UNIT.px);
  const layer = useSelector((state) => state.draw.layer);
  const page = useSelector((state) => state.draw.page);

  let [layerCount, setLayerCount] = useState(1);
  const [openedInfo, setOpenedInfo] = useState(false);

  const prediectLayerName = (o) => o.name === "layer" + layerCount;
  const getNextLayerName = () => {
    while (layer.some(prediectLayerName)) layerCount++;
    setLayerCount(layerCount + 1);
    return "layer" + layerCount;
  };

  return (
    <Group position="center" spacing="xs">
      <Tooltip label="New canvas" withArrow>
        <ActionIcon variant="subtle" onClick={() => dispatch(setLayer([]))}>
          <IconFile />
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />
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
                  .file("layout.json")
                  .async("string")
                  .then((strLayout) =>
                    dispatch(setLayout(JSON.parse(strLayout)))
                  );

                zip
                  .file("layer.json")
                  .async("string")
                  .then(async (strLayer) => {
                    const imgKeys = Object.keys(zip.files).filter(
                      (s) => s.startsWith("images/") && !zip.files[s].dir
                    );
                    let idxToKey = {};
                    imgKeys.forEach((k) => {
                      const idxs = [...k.matchAll(/(\d+|default)/g)].map(
                        (m) => m[0]
                      );
                      if (idxs.length < 2) return;

                      if (!idxToKey[idxs[0]]) idxToKey[idxs[0]] = {};
                      idxToKey[idxs[0]][idxs[1]] = k;
                    });

                    let jsonLayer = JSON.parse(strLayer);
                    const families = [
                      ...new Set(jsonLayer.map((l) => l.font?.family)),
                    ].filter((font) => font !== undefined);
                    if (families.length) WebFont.load({ google: { families } });

                    try {
                      dispatch(
                        setLayer(
                          await Promise.all(
                            jsonLayer.map(async (l, i) => {
                              if (l.type === TYPE.image) {
                                const key = idxToKey[String(i)]["default"];
                                // Default
                                if (key)
                                  await zip
                                    .file(key)
                                    .async("blob")
                                    .then((blob) => {
                                      const matches = key.match(/\.\w+/g);
                                      l.var.default = URL.createObjectURL(
                                        blob.slice(
                                          0,
                                          blob.size,
                                          extToMime[matches[matches.length - 1]]
                                        )
                                      );
                                    });

                                // Variable
                                await Promise.all(
                                  Object.keys(l.var.img).map(async (v, j) => {
                                    const key = idxToKey[String(i)][String(j)];
                                    if (key)
                                      await zip
                                        .file(key)
                                        .async("blob")
                                        .then((blob) => {
                                          const matches = key.match(/\.\w+/g);
                                          l.var.img[v] = URL.createObjectURL(
                                            blob.slice(
                                              0,
                                              blob.size,
                                              extToMime[
                                                matches[matches.length - 1]
                                              ]
                                            )
                                          );
                                        });
                                  })
                                );
                              }
                              return l;
                            })
                          )
                        )
                      );

                      showNotification({
                        title: "Imported successfully",
                        message: `${jsonLayer.length} layers imported`,
                        color: "green",
                      });
                    } catch (err) {
                      console.error(err);
                    }
                  });
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
            // Archive design project
            (async () => {
              const zip = require("jszip")();

              // Save layout
              zip.file("layout.json", JSON.stringify({ ...layout, ratio: 1 }));

              // Save layer
              const copiedLayer = layer.map((l) => {
                if (l.type !== TYPE.image) return l;

                let img = {};
                if (l.var?.img)
                  Object.keys(l.var.img).forEach((key) => (img[key] = ""));

                return {
                  ...l,
                  var: {
                    default: "",
                    format: l.var.format ? l.var.format : "",
                    img,
                  },
                };
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

              // Save web shortcut
              zip.file(
                `${DOMAIN}.url`,
                `[InternetShortcut]
                URL=https://${DOMAIN}/`
              );

              return zip;
            })().then((zip) => {
              zip.generateAsync({ type: "blob" }).then((content) => {
                // see FileSaver.js
                saveAs(content, "Design.zip");
                showNotification({
                  title: "Saving design project successfully",
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
                  x: layoutPx.w / 2 - 10,
                  y: layoutPx.h / 2 - 10,
                  w: 20,
                  h: 20,
                },
                border: {
                  style: "solid",
                  width: 1,
                  color: { value: "#000000" },
                },
              })
            )
          }
        >
          {typeToIcon(TYPE.rect)}
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
                  x: layoutPx.w / 2 - 10,
                  y: layoutPx.h / 2 - 10,
                  w: 20,
                  h: 20,
                },
                border: {
                  style: "solid",
                  width: 1,
                  color: { value: "#000000" },
                },
              })
            )
          }
        >
          {typeToIcon(TYPE.circle)}
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
                  x: layoutPx.w / 2 - 10,
                  y: layoutPx.h / 2 - 10,
                },
                font: {
                  size: 10,
                  weight: 400,
                  color: { value: "#000000" },
                },
                var: [
                  {
                    value: Math.random(),
                    label: "New Text",
                    group: GROUP.CONST,
                  },
                ],
              })
            );
          }}
        >
          {typeToIcon(TYPE.text)}
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
            const wRatio = layoutPx.w / img.width;
            const hRatio = layoutPx.h / img.height;
            const w = Math.floor(Math.min(wRatio, hRatio) * img.width);
            const h = Math.floor(Math.min(wRatio, hRatio) * img.height);

            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.image,
                size: {
                  x: layoutPx.w / 2 - w / 2,
                  y: layoutPx.h / 2 - h / 2,
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
              leftIcon={typeToIcon(TYPE.image)}
              styles={() => ({ leftIcon: { marginRight: 0 } })}
              {...props}
            />
          </Tooltip>
        )}
      </FileButton>
      <Tooltip label="Bar code" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() =>
            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.bar,
                size: {
                  x: layoutPx.w / 2 - 20,
                  y: layoutPx.h / 2 - 10,
                  h: 20,
                },
              })
            )
          }
        >
          {typeToIcon(TYPE.bar)}
        </ActionIcon>
      </Tooltip>
      <Tooltip label="QR code" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() =>
            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.qr,
                size: {
                  x: layoutPx.w / 2 - 10,
                  y: layoutPx.h / 2 - 10,
                  w: 20,
                },
              })
            )
          }
        >
          {typeToIcon(TYPE.qr)}
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />
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
        opened={openedInfo}
        label={
          <>
            <Title order={5} align="center">
              # {page}
            </Title>
            <Divider my={4} />
            {data[page] &&
              Object.entries(data[page]).map(([k, v], j) => (
                <Group key={`tooltip-${page}-${j}`} spacing="xs">
                  <Title order={6}>{k}</Title>
                  <Text size="xs">{v}</Text>
                </Group>
              ))}
          </>
        }
      >
        <ActionIcon variant="subtle" onClick={() => setOpenedInfo((b) => !b)}>
          <IconInfoCircle />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
