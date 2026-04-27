import type { Metadata } from "next";

export type AppLocale = "pt" | "en";

export const SITE_URL = "https://animecaos.xyz";
export const SITE_NAME = "AnimeCaos";
export const SITE_X_URL = "https://x.com/getanimecaos";
export const SITE_X_HANDLE = "@getanimecaos";
export const PT_HOME_TITLE = "AnimeCaos - Assistir Animes Online Grátis";
export const PT_HOME_DESCRIPTION =
  "Assistir animes dublados e legendados no AnimeCaos. A melhor maneira de assistir animes grátis, sem anuncios, basta baixar o app e ver seus animes favoritos em hd, atualizados diariamente.";
export const EN_HOME_TITLE = "AnimeCaos - Watch Anime Online for Free";
export const EN_HOME_DESCRIPTION =
  "Watch dubbed and subtitled anime on AnimeCaos. The best ad-free way to stream anime online.";
const OPEN_GRAPH_LOCALE: Record<AppLocale, string> = {
  pt: "pt_BR",
  en: "en_US",
};

function normalizePathname(pathname = ""): string {
  if (!pathname) return "";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function toAppLocale(locale: string): AppLocale {
  return locale === "en" ? "en" : "pt";
}

export function buildLocalizedMetadata({
  locale,
  pathname = "",
  title,
  absoluteTitle,
  description,
  keywords,
}: {
  locale: AppLocale;
  pathname?: string;
  title: string;
  absoluteTitle?: string;
  description: string;
  keywords?: string[];
}): Metadata {
  const path = normalizePathname(pathname);
  // PT is served at root (no /pt prefix); EN keeps /en prefix
  const canonical = locale === "pt" ? `${SITE_URL}${path}` : `${SITE_URL}/en${path}`;
  const finalTitle = absoluteTitle ?? title;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        pt: `${SITE_URL}${path}`,
        en: `${SITE_URL}/en${path}`,
        "x-default": `${SITE_URL}${path}`,
      },
    },
    openGraph: {
      title: finalTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: OPEN_GRAPH_LOCALE[locale],
      alternateLocale: [locale === "pt" ? OPEN_GRAPH_LOCALE.en : OPEN_GRAPH_LOCALE.pt],
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_X_HANDLE,
      creator: SITE_X_HANDLE,
      title: finalTitle,
      description,
    },
  };
}
