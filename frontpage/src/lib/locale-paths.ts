const EN_PREFIX = "/en";
const LEGACY_PT_PREFIX = "/pt";

function normalizePathname(pathname = "/"): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname);

  if (normalized === EN_PREFIX || normalized === LEGACY_PT_PREFIX) {
    return "/";
  }

  if (normalized.startsWith(`${EN_PREFIX}/`)) {
    return normalized.slice(EN_PREFIX.length);
  }

  if (normalized.startsWith(`${LEGACY_PT_PREFIX}/`)) {
    return normalized.slice(LEGACY_PT_PREFIX.length);
  }

  return normalized;
}

export function localizePath(locale: string, pathname = "/"): string {
  const normalized = normalizePathname(pathname);
  const prefix = locale === "en" ? EN_PREFIX : "";

  if (normalized === "/") {
    return prefix || "/";
  }

  return `${prefix}${normalized}`;
}

export function localizeCurrentPath(pathname: string, targetLocale: string): string {
  const normalizedWithoutLocale = stripLocalePrefix(pathname);
  return localizePath(targetLocale, normalizedWithoutLocale);
}
