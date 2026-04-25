import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { PT_HOME_DESCRIPTION } from "@/lib/seo";
import { ReleaseProvider } from "@/lib/release/context";

function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://animecaos.xyz/#organization",
        name: "AnimeCaos",
        url: "https://animecaos.xyz",
        logo: "https://animecaos.xyz/icon.png",
        sameAs: [
          "https://github.com/henriqqw/animecaos",
          "https://x.com/getanimecaos",
          "https://caosdev.vercel.app",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://animecaos.xyz/#website",
        url: "https://animecaos.xyz",
        name: "AnimeCaos",
        description: PT_HOME_DESCRIPTION,
        publisher: { "@id": "https://animecaos.xyz/#organization" },
        inLanguage: ["pt-BR"],
      },
    ],
  };
}

export default async function PtLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages({ locale: "pt" });
  const organizationJsonLd = buildOrganizationJsonLd();

  return (
    <NextIntlClientProvider locale="pt" messages={messages}>
      <ReleaseProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <div className="grid-bg" aria-hidden="true" />
        {children}
      </ReleaseProvider>
    </NextIntlClientProvider>
  );
}
