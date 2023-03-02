import { defaultLocale } from "@/pages";

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

export default function iniToJson(ini) {
  const result = {};
  let key = "";

  ini.split("\n").forEach((line) => {
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
