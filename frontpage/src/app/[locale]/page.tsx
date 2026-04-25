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
  EN_HOME_DESCRIPTION,
  EN_HOME_TITLE,
  PT_HOME_DESCRIPTION,
  PT_HOME_TITLE,
  toAppLocale,
} from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = toAppLocale((await params).locale);
  const isPt = locale === "pt";
  const title = isPt ? PT_HOME_TITLE : EN_HOME_TITLE;
  const description = isPt ? PT_HOME_DESCRIPTION : EN_HOME_DESCRIPTION;

  return buildLocalizedMetadata({
    locale,
    title,
    absoluteTitle: title,
    description,
    keywords: isPt
      ? [
          "AnimeCaos",
          "assistir animes online",
          "animes gratis",
          "animes dublados",
          "animes legendados",
          "app de anime",
          "anime sem anuncios",
        ]
      : ["AnimeCaos", "watch anime", "anime download", "anime player", "free anime", "desktop anime player", "ad-free anime"],
  });
}

const getSitelinksJsonLd = () => {
  const baseUrl = "https://animecaos.xyz/en";
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      { "@type": "SiteNavigationElement", position: 1, name: "About", url: `${baseUrl}/about` },
      { "@type": "SiteNavigationElement", position: 2, name: "Download", url: `${baseUrl}/download` },
      { "@type": "SiteNavigationElement", position: 3, name: "How to Use", url: `${baseUrl}/how-to-use` },
      { "@type": "SiteNavigationElement", position: 4, name: "Contact", url: `${baseUrl}/contact` },
    ],
  };
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <PageWrapper locale={locale}>
      <Script
        id="sitelinks-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getSitelinksJsonLd()) }}
      />
      <Hero locale={locale} />
      <Features />
      <Stats />
      <Screenshots />
      <SocialFeed />
      <DownloadCTA />
    </PageWrapper>
  );
}
