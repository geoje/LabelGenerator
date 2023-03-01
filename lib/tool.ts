import { defaultLocale } from "@/pages";

export function createPathWithLocale(locale: string, path: string): string {
  return locale.length > 0 && locale !== defaultLocale
    ? "/" + locale + path
    : path;
}
