import type { Metadata } from "next";

export type AppLocale = "pt" | "en";

export const SITE_URL = "https://animecaos.vercel.app";
export const SITE_NAME = "AnimeCaos";
export const SITE_X_URL = "https://x.com/getanimecaos";
export const SITE_X_HANDLE = "@getanimecaos";
export const PT_HOME_TITLE = "AnimeCaos - Assistir Animes Online Gr\u00e1tis";
export const PT_HOME_DESCRIPTION =
  "Assistir animes dublados e legendados no AnimeCaos. A melhor maneira de assistir animes gr\u00e1tis, sem anuncios, basta baixar o app e ver seus animes favoritos em hd, atualizados diariamente.";
export const EN_HOME_TITLE = "AnimeCaos - Watch Anime Online for Free";
export const EN_HOME_DESCRIPTION =
  "Watch dubbed and subtitled anime on AnimeCaos. The best ad-free way to stream anime online.";
const SOCIAL_IMAGE_URL = `${SITE_URL}/icon.png`;

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
  const canonical = `${SITE_URL}/${locale}${path}`;
  const finalTitle = absoluteTitle ?? title;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        pt: `${SITE_URL}/pt${path}`,
        en: `${SITE_URL}/en${path}`,
        "x-default": `${SITE_URL}/pt${path}`,
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
      images: [{ url: SOCIAL_IMAGE_URL, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_X_HANDLE,
      creator: SITE_X_HANDLE,
      title: finalTitle,
      description,
      images: [SOCIAL_IMAGE_URL],
    },
  };
}
