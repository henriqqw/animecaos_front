import type { Metadata } from "next";
import Script from "next/script";
import PageWrapper from "@/components/layout/PageWrapper";
import DownloadContent from "@/components/sections/DownloadContent";
import { buildLocalizedMetadata, toAppLocale } from "@/lib/seo";
import type { LatestRelease } from "@/app/api/github-downloads/route";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const locale = toAppLocale((await params).locale);
    const isPt = locale === "pt";

    return buildLocalizedMetadata({
        locale,
        pathname: "/download",
        title: isPt ? "Download do AnimeCaos" : "AnimeCaos Download",
        description: isPt
            ? "Baixe o AnimeCaos para Windows em um pacote unico, sem dependencias extras."
            : "Download AnimeCaos for Windows in one package with no extra dependencies.",
    });
}

async function getLatestRelease(): Promise<LatestRelease> {
    const fallback: LatestRelease = {
        tag: "v0.1.3",
        version: "0.1.3",
        windows_url: "https://github.com/henriqqw/AnimeCaos/releases/download/v0.1.3/Setup_AnimeCaos_v0.1.3.exe",
        changelog: [],
    };
    try {
        const res = await fetch("https://api.github.com/repos/henriqqw/AnimeCaos/releases", {
            headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return fallback;
        const releases = await res.json();
        const latest = releases.find((r: { prerelease: boolean }) => !r.prerelease);
        if (!latest) return fallback;
        const exe = latest.assets?.find((a: { name: string }) => a.name.endsWith(".exe"));
        return {
            tag: latest.tag_name,
            version: latest.tag_name.replace(/^v/, ""),
            windows_url: exe?.browser_download_url ?? fallback.windows_url,
            changelog: [],
        };
    } catch {
        return fallback;
    }
}

export default async function DownloadPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const latest = await getLatestRelease();

    const softwareJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "AnimeCaos",
        operatingSystem: "Windows",
        applicationCategory: "MultimediaApplication",
        softwareVersion: latest.version,
        downloadUrl: latest.windows_url,
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        description: "Hub de anime desktop open source. Player limpo, download offline, integracao AniList.",
        publisher: { "@type": "Organization", name: "caosdev", url: "https://caosdev.vercel.app" },
    };

    return (
        <PageWrapper locale={locale}>
            <Script
                id="software-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
            />
            <DownloadContent />
        </PageWrapper>
    );
}
