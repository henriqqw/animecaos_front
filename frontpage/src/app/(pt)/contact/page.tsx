import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import ContactContent from "@/components/sections/ContactContent";
import { buildLocalizedMetadata } from "@/lib/seo";

export const metadata: Metadata = buildLocalizedMetadata({
  locale: "pt",
  pathname: "/contact",
  title: "Contato do AnimeCaos",
  description: "Entre em contato com o criador do AnimeCaos por GitHub, Discord, Twitter ou email.",
});

export default function ContactPage() {
  return (
    <PageWrapper locale="pt">
      <ContactContent />
    </PageWrapper>
  );
}
