import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { EN_HOME_DESCRIPTION, PT_HOME_DESCRIPTION } from "@/lib/seo";
import "../globals.css";

const locales = ["pt", "en"] as const;

function buildOrganizationJsonLd(locale: "pt" | "en") {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://animecaos.vercel.app/#organization",
        name: "AnimeCaos",
        url: "https://animecaos.vercel.app",
        logo: "https://animecaos.vercel.app/icon.png",
        sameAs: [
          "https://github.com/henriqqw/animecaos",
          "https://x.com/getanimecaos",
          "https://caosdev.vercel.app",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://animecaos.vercel.app/#website",
        url: "https://animecaos.vercel.app",
        name: "AnimeCaos",
        description: locale === "pt" ? PT_HOME_DESCRIPTION : EN_HOME_DESCRIPTION,
        publisher: { "@id": "https://animecaos.vercel.app/#organization" },
        inLanguage: locale === "pt" ? ["pt-BR"] : ["en-US"],
      },
    ],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const appLocale = locale as (typeof locales)[number];
  const messages = await getMessages({ locale: appLocale });
  const organizationJsonLd = buildOrganizationJsonLd(appLocale);

  return (
    <NextIntlClientProvider locale={appLocale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div className="grid-bg" aria-hidden="true" />
      {children}
    </NextIntlClientProvider>
  );
}
