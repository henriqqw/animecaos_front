import { NextResponse } from "next/server";

export const revalidate = 300;

interface GithubAsset {
  name: string;
  browser_download_url: string;
  download_count: number;
}

interface GithubRelease {
  tag_name: string;
  prerelease: boolean;
  published_at: string;
  body: string | null;
  assets: GithubAsset[];
}

export interface LatestRelease {
  tag: string;
  version: string;
  windows_url: string | null;
  linux_url: string | null;
  changelog: string[];
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
    .trim();
}

function parseChangelog(body: string | null): string[] {
  if (!body) return [];
  return body
    .split("\n")
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .map((l) => stripMarkdown(l.replace(/^\s*[-*]\s+/, "")))
    .filter(Boolean);
}

export interface ReleaseChangelog {
  tag: string;
  date: string;
  items: string[];
}

export interface DownloadsResponse {
  total: number;
  releases: { tag: string; count: number }[];
  latest: LatestRelease | null;
  changelogs: ReleaseChangelog[];
  cached_at: string;
}

export async function GET() {
  const res = await fetch("https://api.github.com/repos/henriqqw/AnimeCaos/releases", {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "GitHub API unavailable" }, { status: 502 });
  }

  const releases: GithubRelease[] = await res.json();

  const data: DownloadsResponse = {
    total: 0,
    releases: [],
    latest: null,
    changelogs: [],
    cached_at: new Date().toISOString(),
  };

  for (const rel of releases) {
    const count = rel.assets.reduce((sum, a) => sum + a.download_count, 0);
    data.total += count;
    data.releases.push({ tag: rel.tag_name, count });

    if (!rel.prerelease) {
      const items = parseChangelog(rel.body);
      if (items.length > 0) {
        data.changelogs.push({ tag: rel.tag_name, date: rel.published_at, items });
      }
      if (!data.latest) {
        const exe = rel.assets.find((a) => a.name.endsWith(".exe"));
        const appImage = rel.assets.find((a) => a.name.toLowerCase().endsWith(".appimage"));
        data.latest = {
          tag: rel.tag_name,
          version: rel.tag_name.replace(/^v/, ""),
          windows_url: exe?.browser_download_url ?? null,
          linux_url: appImage?.browser_download_url ?? null,
          changelog: items,
        };
      }
    }
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" },
  });
}
