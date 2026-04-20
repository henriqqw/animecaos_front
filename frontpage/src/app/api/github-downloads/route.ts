import { NextResponse } from "next/server";

export const revalidate = 3600;

interface GithubAsset {
  name: string;
  browser_download_url: string;
  download_count: number;
}

interface GithubRelease {
  tag_name: string;
  prerelease: boolean;
  assets: GithubAsset[];
}

export interface LatestRelease {
  tag: string;
  version: string;
  windows_url: string | null;
}

export interface DownloadsResponse {
  total: number;
  releases: { tag: string; count: number }[];
  latest: LatestRelease | null;
  cached_at: string;
}

export async function GET() {
  const res = await fetch("https://api.github.com/repos/henriqqw/AnimeCaos/releases", {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "GitHub API unavailable" }, { status: 502 });
  }

  const releases: GithubRelease[] = await res.json();

  const data: DownloadsResponse = {
    total: 0,
    releases: [],
    latest: null,
    cached_at: new Date().toISOString(),
  };

  for (const rel of releases) {
    const count = rel.assets.reduce((sum, a) => sum + a.download_count, 0);
    data.total += count;
    data.releases.push({ tag: rel.tag_name, count });

    if (!data.latest && !rel.prerelease) {
      const exe = rel.assets.find((a) => a.name.endsWith(".exe"));
      data.latest = {
        tag: rel.tag_name,
        version: rel.tag_name.replace(/^v/, ""),
        windows_url: exe?.browser_download_url ?? null,
      };
    }
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" },
  });
}
