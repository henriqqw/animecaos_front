"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackDownloadClick, trackEvent, trackFirstOpen, trackPageView } from "@/lib/analytics/client";

const DOWNLOAD_URL_PATTERN = /github\.com\/henriqqw\/AnimeCaos\/releases\/download\//i;

function buildPathnameWithQuery(pathname: string, searchParams: URLSearchParams): string {
  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function resolveDownloadChannel(anchor: HTMLAnchorElement): string {
  if (anchor.dataset.analyticsChannel) {
    return anchor.dataset.analyticsChannel;
  }

  if (anchor.id) {
    return anchor.id;
  }

  return "download_link";
}

export default function FirstPartyTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    void trackFirstOpen();

    const handleAppInstalled = () => {
      void trackEvent({
        eventName: "pwa_installed",
        metadata: {
          source: "appinstalled"
        }
      });
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const currentPath = buildPathnameWithQuery(pathname, searchParams);
    if (lastTrackedPathRef.current === currentPath) {
      return;
    }

    lastTrackedPathRef.current = currentPath;
    void trackPageView(currentPath);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) {
        return;
      }

      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href") ?? "";
      if (!DOWNLOAD_URL_PATTERN.test(href)) {
        return;
      }

      const channel = resolveDownloadChannel(anchor);
      void trackDownloadClick(channel, href);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
