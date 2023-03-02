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
