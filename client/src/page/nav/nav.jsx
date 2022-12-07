import { useSelector, useDispatch } from "react-redux";
import {
  Stepper,
  Button,
  Grid,
  Group,
  ActionIcon,
  useMantineColorScheme,
  Paper,
  FileButton,
  Tooltip,
} from "@mantine/core";
import {
  IconSun,
  IconMoonStars,
  IconFileSpreadsheet,
  IconPalette,
  IconRuler3,
  IconFolder,
  IconDeviceFloppy,
} from "@tabler/icons";
import { saveAs } from "file-saver";
import { set as setData } from "../import/dataSlice";
import {
  TYPE,
  setLayout as setDrawLayout,
  setLayer,
} from "../design/drawSlice";
import { setLayout as setPaperLayout } from "../calibrate/paperSlice";
import { MAX_NAV, next, prev, set as setNav } from "./stepSlice";
import { showNotification } from "@mantine/notifications";
import WebFont from "webfontloader";

const ICON_SIZE = 18;
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

function LoadFile(file, dispatch) {
  // Empty
  if (!file) return;

  require("jszip")()
    .loadAsync(file)
    .then(
      (zip) => {
        let noFiles = [];
        // Check layer.json
        if (!zip.files["layer.json"]) {
          showNotification({
            title: "No layer.json",
            message: "There is no layer.json file in the root directory",
            color: "read",
          });
          return;
        }

        // data
        let zo = zip.file("data.json");
        if (zo)
          zo.async("string").then((strData) =>
            dispatch(setData(JSON.parse(strData)))
          );
        else noFiles.push("data.json");

        // drawLayout
        zo = zip.file("drawLayout.json");
        if (zo)
          zo.async("string").then((strLayout) =>
            dispatch(setDrawLayout(JSON.parse(strLayout)))
          );
        else noFiles.push("drawLayout.json");

        // paperLayout
        zo = zip.file("paperLayout.json");
        if (zo)
          zo.async("string").then((strLayout) =>
            dispatch(setPaperLayout(JSON.parse(strLayout)))
          );
        else noFiles.push("paperLayout.json");

        // layer
        zo = zip.file("layer.json");
        if (!zo) noFiles.push("layer.json");
        else
          zo.async("string").then(async (strLayer) => {
            const imgKeys = Object.keys(zip.files).filter(
              (s) => s.startsWith("images/") && !zip.files[s].dir
            );
            let idxToKey = {};
            imgKeys.forEach((k) => {
              const idxs = [...k.matchAll(/(\d+|default)/g)].map((m) => m[0]);
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
                                      extToMime[matches[matches.length - 1]]
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
            } catch (err) {
              noFiles.push("layer.json");
              console.error(err);
            }
          });

        if (noFiles.length === 4)
          showNotification({
            title: "Imported failed",
            message: `${noFiles.join(", ")} not be imported`,
            color: "red",
          });
        else if (noFiles.length > 0)
          showNotification({
            title: "Partially imported",
            message: `${noFiles.join(", ")} not be imported`,
            color: "yellow",
          });
        else {
          showNotification({
            title: "Imported successfully",
            message: `Project imported`,
            color: "green",
          });
          dispatch(setNav(MAX_NAV));
        }
      },
      (err) => {
        console.error(err);
      }
    );
}
function SaveFile(data, layer, drawLayout, paperLayout) {
  // Archive design project
  (async () => {
    const zip = require("jszip")();

    // Save data
    zip.file("data.json", JSON.stringify(data));

    // Save layout
    zip.file("drawLayout.json", JSON.stringify({ ...drawLayout, ratio: 1 }));
    zip.file("paperLayout.json", JSON.stringify(paperLayout));

    // Save layer
    const copiedLayer = layer.map((l) => {
      if (l.type !== TYPE.image) return l;

      let img = {};
      if (l.var?.img) Object.keys(l.var.img).forEach((key) => (img[key] = ""));

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
      saveAs(content, "LabelProject.zip");

      // create size content

      showNotification({
        title: "Saving design project successfully",
        message: `File size is ${Math.ceil(
          content.size > 1024 * 1024
            ? content.size / 1024 / 1024
            : content.size > 1024
            ? content.size / 1024
            : content.size
        )}${
          content.size > 1024 * 1024 ? "MB" : content.size > 1024 ? "KB" : "B"
        }`,
        color: "green",
      });
    });
  });
}
export default function Nav() {
  // Provider
  const dispatch = useDispatch();
  const step = useSelector((state) => state.step.value);

  // For load and save file
  const data = useSelector((state) => state.data.value);
  const layer = useSelector((state) => state.draw.layer);
  const drawLayout = useSelector((state) => state.draw.layout);
  const paperLayout = useSelector((state) => state.paper.layout);

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Paper
      sx={() => ({
        borderRadius: 0,
      })}
    >
      <Grid
        sx={(theme) => ({
          borderBottom: `1px solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.gray[2]
          }`,
        })}
        m={0}
        p="xs"
      >
        <Grid.Col span={6} md={3} order={2} orderMd={1}>
          <Group>
            {step > 0 && <Button onClick={() => dispatch(prev())}>Back</Button>}

            <FileButton
              sx={() => {
                return { width: 34, height: 34 };
              }}
              variant="outline"
              color="blue"
              accept="application/zip"
              onChange={(file) => {
                LoadFile(file, dispatch);
              }}
            >
              {(props) => (
                <Tooltip label="Load project" withArrow>
                  <Button
                    p={0}
                    color="gray"
                    variant="subtle"
                    leftIcon={<IconFolder size={ICON_SIZE} />}
                    styles={() => ({ leftIcon: { marginRight: 0 } })}
                    {...props}
                  />
                </Tooltip>
              )}
            </FileButton>

            <Tooltip label="Save project" withArrow>
              <ActionIcon
                variant="outline"
                color={"blue"}
                onClick={() => SaveFile(data, layer, drawLayout, paperLayout)}
                size="lg"
              >
                <IconDeviceFloppy size={ICON_SIZE} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Grid.Col>
        <Grid.Col span={12} md={6} order={1} orderMd={2}>
          <Stepper
            active={step}
            onStepClick={(current) => dispatch(setNav(current))}
          >
            <Stepper.Step
              label="Set data"
              icon={<IconFileSpreadsheet size={ICON_SIZE} />}
            />
            <Stepper.Step
              label="Design label"
              icon={<IconPalette size={ICON_SIZE} />}
            />
            <Stepper.Step
              label="Set paper"
              icon={<IconRuler3 size={ICON_SIZE} />}
            />
          </Stepper>
        </Grid.Col>
        <Grid.Col span={6} md={3} order={3}>
          <Group position="right">
            <Tooltip label="Toggle color scheme" withArrow>
              <ActionIcon
                variant="outline"
                color={dark ? "yellow" : "blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {dark ? (
                  <IconSun size={ICON_SIZE} />
                ) : (
                  <IconMoonStars size={ICON_SIZE} />
                )}
              </ActionIcon>
            </Tooltip>

            {step < MAX_NAV && (
              <Button onClick={() => dispatch(next())}>Next</Button>
            )}
          </Group>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
