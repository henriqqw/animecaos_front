import type { Metadata } from "next";
import { PT_HOME_DESCRIPTION, PT_HOME_TITLE, SITE_NAME, SITE_URL, SITE_X_HANDLE } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: PT_HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: PT_HOME_DESCRIPTION,
  keywords: [
    "AnimeCaos",
    "assistir animes online",
    "animes gratis",
    "animes dublados",
    "animes legendados",
    "app de anime",
    "anime sem anuncios",
  ],
  robots: { index: true, follow: true },
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
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_X_HANDLE,
    creator: SITE_X_HANDLE,
    title: PT_HOME_TITLE,
    description: PT_HOME_DESCRIPTION,
  },
  verification: {
    google: "jWtvjWsVOFaDn8KdIc4PV5dvtiX_6GwTVNvy3xJ75WQ",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <script defer src="https://umami-rose-chi.vercel.app/script.js" data-website-id="c82f21ea-7dea-4338-bd1e-579eeb0686f9" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
