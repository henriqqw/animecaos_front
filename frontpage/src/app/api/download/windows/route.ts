import { NextResponse } from "next/server";

export const revalidate = 300;

const LATEST_RELEASE_URL = "https://github.com/henriqqw/AnimeCaos/releases/latest";

interface GithubAsset {
  name: string;
  browser_download_url: string;
}

interface GithubRelease {
  assets?: GithubAsset[];
}

export async function GET() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/henriqqw/AnimeCaos/releases/latest",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        next: { revalidate: 300 },
      },
    );

    if (response.ok) {
      const release: GithubRelease = await response.json();
      const installer = release.assets?.find((asset) =>
        /windows.*setup\.exe$/i.test(asset.name),
      );

      if (installer) {
        const assetUrl = new URL(installer.browser_download_url);
        if (
          assetUrl.protocol === "https:" &&
          assetUrl.hostname === "github.com" &&
          assetUrl.pathname.startsWith("/henriqqw/AnimeCaos/releases/download/")
        ) {
          return NextResponse.redirect(assetUrl, {
            status: 302,
            headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300" },
          });
        }
      }
    }
  } catch {
    // Fall through to GitHub's latest release page if the API is unavailable.
  }

  return NextResponse.redirect(LATEST_RELEASE_URL, {
    status: 302,
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
