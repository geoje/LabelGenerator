import { defaultLocale } from "@/pages";

export function createPathWithLocale(path: string, locale: string): string {
  return locale.length > 0 && locale !== defaultLocale
    ? "/" + locale + path
    : path;
}
