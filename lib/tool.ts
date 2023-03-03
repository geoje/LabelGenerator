import { defaultLocale } from "@/pages";
import { showNotification } from "@mantine/notifications";
import { saveAs } from "file-saver";
import {
  getFontFamilies,
  GROUP_FONT,
  setFontMap,
  setLayer,
  TYPE,
} from "./drawSlice";
import { setData } from "./dataSlice";
import { setLayout as setDrawLayout } from "./drawSlice";
import { setLayout as setPaperLayout } from "./paperSlice";
import { setCondition, setExclude } from "./printSlice";

export function createPathWithLocale(path: string, locale: string): string {
  return locale.length > 0 && locale !== defaultLocale
    ? "/" + locale + path
    : path;
}

export function StringReplaceAt(
  str: string,
  index: number,
  replacement: string
) {
  return (
    str.substring(0, index) +
    replacement +
    str.substring(index + replacement.length)
  );
}

export default function iniToJson(ini: any) {
  const result: any = {};
  let key = "";

  ini.split("\n").forEach((line: any) => {
    line = line.trim();

    if (/^\[.+\]$/.test(line)) {
      key = line.slice(1, line.length - 1);
      result[key] = {};
    } else {
      const sepIdx = line.indexOf("=");
      if (sepIdx !== -1) {
        result[key][line.slice(0, sepIdx)] = line.slice(
          sepIdx + 1,
          line.length
        );
      }
    }
  });
  return result;
}

const mimeToExt: any = {
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
const extToMime: any = {
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
  ["print.condition.json", setCondition],
  ["print.exclude.json", setExclude],
];
export async function LoadFile(file: any, dispatch: any) {
  // If empty
  if (!file) return false;

  return await require("jszip")()
    .loadAsync(file)
    .then(
      async (zip: any) => {
        let zo,
          noFiles: any = [];

        // General load from file
        generalLoadSet.forEach((o: any) => {
          zo = zip.file("json/" + o[0]);
          if (zo) {
            try {
              zo.async("string").then((str: any) => {
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
          zo.async("string").then(async (strLayer: any) => {
            const imgKeys = Object.keys(zip.files).filter(
              (s) => s.startsWith("image/") && !zip.files[s].dir
            );
            let idxToKey: any = {};
            imgKeys.forEach((k) => {
              const idxs = Array.from(k.matchAll(/(\d+|default)/g)).map(
                (m) => m[0]
              );
              if (idxs.length < 2) return;

              if (!idxToKey[idxs[0]]) idxToKey[idxs[0]] = {};
              idxToKey[idxs[0]][idxs[1]] = k;
            });

            // Load fonts
            let jsonLayer = JSON.parse(strLayer);
            const families = getFontFamilies(jsonLayer);
            // Google fonts
            const googleFonts = families
              .filter((o: any) => o.group === GROUP_FONT.GOOGLE)
              .map((o: any) => o.value);
            if (googleFonts.length)
              import("webfontloader").then((loader) =>
                loader.load({ google: { families: [...googleFonts] } })
              );
            // File fonts
            let fontMap: any = {};
            await Promise.all(
              Object.keys(zip.files)
                .filter((s) => /^font\/.+/.test(s))
                .map(async (key: any) => {
                  const filename = key.slice("font/".length);
                  await zip
                    .file(key)
                    .async("blob")
                    .then((blob: any) => {
                      blob = blob.slice(
                        0,
                        blob.size,
                        extToMime[key.match(/\.\w+$/g)[0]]
                      );
                      fontMap[filename] = URL.createObjectURL(blob);
                      return blob.arrayBuffer();
                    })
                    .then((buffer: any) => {
                      const font = new FontFace(filename, buffer);
                      return font.load();
                    })
                    .then((font: any) => {
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
                    jsonLayer.map(async (l: any, i: any) => {
                      if (l.type === TYPE.image) {
                        const key = idxToKey[String(i)]["default"];
                        // Default
                        if (key)
                          await zip
                            .file(key)
                            .async("blob")
                            .then((blob: any) => {
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
                                .then((blob: any) => {
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
            .then((value: any) => {
              const json = iniToJson(value);
              creationDate = json["InternetShortcut"]
                ? json["InternetShortcut"]["Date"]
                  ? json["InternetShortcut"]["Date"]
                  : ""
                : "";
            });
          return new Date(creationDate).toLocaleString();
        };

        return await getCreationDate().then((creationDate) => {
          if (noFiles.length === generalLoadSet.length + 1)
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
            return true;
          }
          return false;
        });
      },
      (err: any) => {
        console.error(err);
        return false;
      }
    );
}
export function SaveFile(
  data: any,
  layer: any,
  fontMap: any,
  drawLayout: any,
  paperLayout: any,
  condition: any,
  exclude: any
) {
  // Archive design project
  (async () => {
    const zip = require("jszip")();

    // Save normal data
    const jsonDir = zip.folder("json");
    jsonDir.file("data.value.json", JSON.stringify(data));
    jsonDir.file("paper.layout.json", JSON.stringify(paperLayout));
    jsonDir.file("print.condition.json", JSON.stringify(condition));
    jsonDir.file("print.exclude.json", JSON.stringify(exclude));

    // Save layout
    jsonDir.file(
      "draw.layout.json",
      JSON.stringify({ ...drawLayout, ratio: 1 })
    );

    // Save layer
    const copiedLayer = layer.map((l: any) => {
      if (l.type !== TYPE.image) return l;

      let img: any = {};
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
      layer.map(async (o: any, i: any) => {
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
        .filter((o: any) => o.group === GROUP_FONT.FILE)
        .map((o: any) => o.value)
        .map(async (fontName: any) => {
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
    zip.generateAsync({ type: "blob" }).then((content: any) => {
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
