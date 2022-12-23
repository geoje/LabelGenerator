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
  getFontFamilies,
  GROUP_FONT,
  setFontMap,
} from "../design/drawSlice";
import { setLayout as setPaperLayout } from "../calibrate/paperSlice";
import { setCondition, setExclude } from "../print/copySlice";
import { MAX_NAV, next, prev, set as setNav } from "./stepSlice";
import { showNotification } from "@mantine/notifications";
import WebFont from "webfontloader";
import iniToJson from "./iniToJson";

const ICON_SIZE = 18;
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

  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const generalLoadSet = [
  ["data.value.json", setData],
  ["draw.layout.json", setDrawLayout],
  ["paper.layout.json", setPaperLayout],
  ["copy.condition.json", setCondition],
  ["copy.exclude.json", setExclude],
];
// '+ 1' mean draw.layer.json
const JSON_COUNT = generalLoadSet.length + 1;

function LoadFile(file, dispatch) {
  // Empty
  if (!file) return;

  require("jszip")()
    .loadAsync(file)
    .then(
      (zip) => {
        let zo,
          noFiles = [];

        // General load from file
        generalLoadSet.forEach((o) => {
          zo = zip.file("json/" + o[0]);
          if (zo) {
            try {
              zo.async("string").then((str) => {
                if (str.length) dispatch(o[1](JSON.parse(str)));
              });
            } catch (err) {
              console.error(err);
              noFiles.push(o[0]);
            }
          } else noFiles.push(o[0]);
        });

        // layer
        zo = zip.file("json/draw.layer.json");
        if (!zo) noFiles.push("draw.layer.json");
        else
          zo.async("string").then(async (strLayer) => {
            const imgKeys = Object.keys(zip.files).filter(
              (s) => s.startsWith("image/") && !zip.files[s].dir
            );
            let idxToKey = {};
            imgKeys.forEach((k) => {
              const idxs = [...k.matchAll(/(\d+|default)/g)].map((m) => m[0]);
              if (idxs.length < 2) return;

              if (!idxToKey[idxs[0]]) idxToKey[idxs[0]] = {};
              idxToKey[idxs[0]][idxs[1]] = k;
            });

            // Load fonts
            let jsonLayer = JSON.parse(strLayer);
            const families = getFontFamilies(jsonLayer);
            // Google fonts
            const googleFonts = families
              .filter((o) => o.group === GROUP_FONT.GOOGLE)
              .map((o) => o.value);
            if (googleFonts.length)
              WebFont.load({ google: { families: [...googleFonts] } });
            // File fonts
            let fontMap = {};
            await Promise.all(
              Object.keys(zip.files)
                .filter((s) => /^font\/.+/.test(s))
                .map(async (key) => {
                  const filename = key.slice("font/".length);
                  await zip
                    .file(key)
                    .async("blob")
                    .then((blob) => {
                      blob = blob.slice(
                        0,
                        blob.size,
                        extToMime[key.match(/\.\w+$/g)[0]]
                      );
                      fontMap[filename] = URL.createObjectURL(blob);
                      return blob.arrayBuffer();
                    })
                    .then((buffer) => {
                      const font = new FontFace(filename, buffer);
                      return font.load();
                    })
                    .then((font) => {
                      document.fonts.add(font);
                    });

                  return key;
                })
            );
            dispatch(setFontMap(fontMap));

            // Load images
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
                              l.var.default = URL.createObjectURL(
                                blob.slice(
                                  0,
                                  blob.size,
                                  extToMime[key.match(/\.\w+$/g)[0]]
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

        // Load creation date
        const getCreationDate = async () => {
          let creationDate = "";
          const urlFilename = Object.keys(zip.files).find((s) =>
            /^(\w|\.)+\.url$/.test(s)
          );
          await zip
            .file(urlFilename)
            .async("string")
            .then((value) => {
              const json = iniToJson(value);
              creationDate = json["InternetShortcut"]
                ? json["InternetShortcut"]["Date"]
                  ? json["InternetShortcut"]["Date"]
                  : ""
                : "";
            });
          return new Date(creationDate).toLocaleString();
        };

        getCreationDate().then((creationDate) => {
          if (noFiles.length === JSON_COUNT)
            showNotification({
              title: "Imported failed",
              message: `${noFiles.join(
                ", "
              )} in the project that was created on ${creationDate} is not imported`,
              color: "red",
            });
          else if (noFiles.length > 0)
            showNotification({
              title: "Partially imported",
              message: `${noFiles.join(
                ", "
              )} in the project that was created on ${creationDate} is not imported`,
              color: "yellow",
            });
          else {
            showNotification({
              title: "Imported successfully",
              message: `The project that was created on ${creationDate} imported`,
              color: "green",
            });
            dispatch(setNav(MAX_NAV));
          }
        });
      },
      (err) => {
        console.error(err);
      }
    );
}
function SaveFile(
  data,
  layer,
  fontMap,
  drawLayout,
  paperLayout,
  condition,
  exclude
) {
  // Archive design project
  (async () => {
    const zip = require("jszip")();

    // Save normal data
    const jsonDir = zip.folder("json");
    jsonDir.file("data.value.json", JSON.stringify(data));
    jsonDir.file("copy.condition.json", JSON.stringify(condition));
    jsonDir.file("copy.exclude.json", JSON.stringify(exclude));

    // Save layout
    jsonDir.file(
      "draw.layout.json",
      JSON.stringify({ ...drawLayout, ratio: 1 })
    );
    jsonDir.file("paper.layout.json", JSON.stringify(paperLayout));

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
    jsonDir.file("draw.layer.json", JSON.stringify(copiedLayer));

    // Save images
    const imgDir = zip.folder("image");
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

    // Save fonts
    const fontDir = zip.folder("font");
    await Promise.all(
      getFontFamilies(layer)
        .filter((o) => o.group === GROUP_FONT.FILE)
        .map((o) => o.value)
        .map(async (fontName) => {
          await fetch(fontMap[fontName])
            .then((res) => res.blob())
            .then((blob) => fontDir.file(fontName, blob));
        })
    );

    // Save web shortcut with creation date
    zip.file(
      `${window.location.hostname}.url`,
      `[InternetShortcut]\n` +
        `URL=http://${window.location.host}/\n` +
        `Date=${new Date().toISOString()}`
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
  const fontMap = useSelector((state) => state.draw.fontMap);
  const drawLayout = useSelector((state) => state.draw.layout);
  const paperLayout = useSelector((state) => state.paper.layout);
  const condition = useSelector((state) => state.copy.condition);

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
                onClick={() =>
                  SaveFile(
                    data,
                    layer,
                    fontMap,
                    drawLayout,
                    paperLayout,
                    condition
                  )
                }
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
