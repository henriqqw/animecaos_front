import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import HowToContent from "@/components/sections/HowToContent";
import { buildLocalizedMetadata } from "@/lib/seo";

export const metadata: Metadata = buildLocalizedMetadata({
  locale: "pt",
  pathname: "/how-to-use",
  title: "Como Usar o AnimeCaos",
  description: "Aprenda a usar o AnimeCaos em quatro passos: instalar, pesquisar, selecionar e assistir.",
});

export default function HowToPage() {
  return (
    <PageWrapper locale="pt">
      <HowToContent />
    </PageWrapper>
  );
}
