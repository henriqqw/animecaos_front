"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LatestRelease, DownloadsResponse } from "@/app/api/github-downloads/route";

const FALLBACK_URL =
  "https://github.com/henriqqw/AnimeCaos/releases/download/v0.1.3/Setup_AnimeCaos_v0.1.3.exe";

const FALLBACK: LatestRelease = {
  tag: "v0.1.3",
  version: "0.1.3",
  windows_url: FALLBACK_URL,
};

const ReleaseContext = createContext<LatestRelease>(FALLBACK);

export function ReleaseProvider({ children }: { children: ReactNode }) {
  const [release, setRelease] = useState<LatestRelease>(FALLBACK);

  useEffect(() => {
    fetch("/api/github-downloads")
      .then((r) => r.json())
      .then((d: DownloadsResponse) => {
        if (d.latest) setRelease(d.latest);
      })
      .catch(() => null);
  }, []);

  return <ReleaseContext.Provider value={release}>{children}</ReleaseContext.Provider>;
}

export function useRelease(): LatestRelease {
  return useContext(ReleaseContext);
}
