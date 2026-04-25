import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PageWrapper from "@/components/layout/PageWrapper";
import AboutContent from "@/components/sections/AboutContent";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "pt", namespace: "about" });
  return buildLocalizedMetadata({
    locale: "pt",
    pathname: "/about",
    title: "Sobre o AnimeCaos",
    description: t("p1"),
  });
}

export default function AboutPage() {
  return (
    <PageWrapper locale="pt">
      <AboutContent />
    </PageWrapper>
  );
}
