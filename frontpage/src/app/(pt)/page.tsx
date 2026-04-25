import type { Metadata } from "next";
import Script from "next/script";
import PageWrapper from "@/components/layout/PageWrapper";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Stats from "@/components/sections/Stats";
import Screenshots from "@/components/sections/Screenshots";
import DownloadCTA from "@/components/sections/DownloadCTA";
import SocialFeed from "@/components/sections/SocialFeed";
import {
  buildLocalizedMetadata,
  PT_HOME_DESCRIPTION,
  PT_HOME_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = buildLocalizedMetadata({
  locale: "pt",
  title: PT_HOME_TITLE,
  absoluteTitle: PT_HOME_TITLE,
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
});

const sitelinksJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    { "@type": "SiteNavigationElement", position: 1, name: "Sobre", url: `${SITE_URL}/about` },
    { "@type": "SiteNavigationElement", position: 2, name: "Download", url: `${SITE_URL}/download` },
    { "@type": "SiteNavigationElement", position: 3, name: "Como Usar", url: `${SITE_URL}/how-to-use` },
    { "@type": "SiteNavigationElement", position: 4, name: "Contato", url: `${SITE_URL}/contact` },
  ],
};

export default function HomePage() {
  return (
    <PageWrapper locale="pt">
      <Script
        id="sitelinks-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sitelinksJsonLd) }}
      />
      <Hero locale="pt" />
      <Features />
      <Stats />
      <Screenshots />
      <SocialFeed />
      <DownloadCTA />
    </PageWrapper>
  );
}
