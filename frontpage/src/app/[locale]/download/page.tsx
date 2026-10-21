import type { Metadata } from "next";
import Script from "next/script";
import PageWrapper from "@/components/layout/PageWrapper";
import DownloadContent from "@/components/sections/DownloadContent";
import { buildLocalizedMetadata, SITE_URL, toAppLocale } from "@/lib/seo";
import type { LatestRelease } from "@/app/api/github-downloads/route";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const locale = toAppLocale((await params).locale);
    const isPt = locale === "pt";

    return buildLocalizedMetadata({
        locale,
        pathname: "/download",
        title: isPt ? "Download do AnimeCaos" : "AnimeCaos Download",
        description: isPt
            ? "Baixe o instalador completo do AnimeCaos para Windows, com o player e as ferramentas incluídos, sem dependências externas."
            : "Download the complete AnimeCaos Windows installer with the player and tools included, with no external dependencies.",
    });
}

async function getLatestRelease(): Promise<LatestRelease> {
    const fallback: LatestRelease = {
        tag: "v3.0.0",
        version: "3.0.0",
        windows_url: "/api/download/windows",
        linux_url: "https://github.com/henriqqw/AnimeCaos/releases/download/v3.0.0/AnimeCaos-3.0.0-x86_64.AppImage",
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
        const appImage = latest.assets?.find((a: { name: string }) => a.name.toLowerCase().endsWith(".appimage"));
        return {
            tag: latest.tag_name,
            version: latest.tag_name.replace(/^v/, ""),
            windows_url: "/api/download/windows",
            linux_url: appImage?.browser_download_url ?? fallback.linux_url,
            changelog: [],
        };
    } catch {
        return fallback;
    }
}

export default async function DownloadPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isPt = locale === "pt";
    const latest = await getLatestRelease();

    const softwareJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "AnimeCaos",
        operatingSystem: "Windows",
        applicationCategory: "MultimediaApplication",
        softwareVersion: latest.version,
        downloadUrl: `${SITE_URL}/api/download/windows`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        description: isPt
            ? "App desktop open source para animes, com trackers AniList e MyAnimeList, Discord Rich Presence e instalador completo para Windows."
            : "Open-source desktop anime app with AniList and MyAnimeList trackers, Discord Rich Presence and a complete Windows installer.",
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
