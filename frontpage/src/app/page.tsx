import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { PT_HOME_DESCRIPTION, PT_HOME_TITLE, SITE_NAME, SITE_URL, SITE_X_HANDLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: PT_HOME_TITLE },
  description: PT_HOME_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/pt`,
    languages: {
      en: `${SITE_URL}/en`,
      pt: `${SITE_URL}/pt`,
      "x-default": `${SITE_URL}/pt`,
    },
  },
  openGraph: {
    title: PT_HOME_TITLE,
    description: PT_HOME_DESCRIPTION,
    url: `${SITE_URL}/pt`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: `${SITE_URL}/icon.png`, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_X_HANDLE,
    creator: SITE_X_HANDLE,
    title: PT_HOME_TITLE,
    description: PT_HOME_DESCRIPTION,
    images: [`${SITE_URL}/icon.png`],
  },
};

export default function RootPage() {
  permanentRedirect("/pt");
}
