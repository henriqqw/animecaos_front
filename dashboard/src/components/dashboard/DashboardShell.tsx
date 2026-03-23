"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatInteger, formatPercent, humanizeDate } from "@/shared/format";

import type {
  DownloadAttributionItem,
  DownloadAttributionResponse,
  ExplorerBreakdownItem,
  ExplorerEventItem,
  ExplorerResponse,
  ExplorerSeriesPoint
} from "./types";

type RangeOption = "7d" | "30d" | "90d";
type PrimaryTab = "pages" | "routes" | "hostnames";
type AcquisitionTab = "referrers" | "utm";
type DeviceTab = "devices" | "browsers";
type CsvExportBlock = "pages" | "referrers" | "countries" | "events";

const RANGE_LABELS: Record<RangeOption, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days"
};
const DOWNLOAD_OPTIONS: Array<{
  block: CsvExportBlock;
  title: string;
  description: string;
}> = [
  {
    block: "pages",
    title: "Pages",
    description: "Paginas, rotas e visualizacoes por visitante."
  },
  {
    block: "referrers",
    title: "Referrers",
    description: "Origem do trafego e parametros UTM."
  },
  {
    block: "countries",
    title: "Countries",
    description: "Distribuicao geografica por pais."
  },
  {
    block: "events",
    title: "Events",
    description: "Eventos agregados (page_view, download_click, first_open)."
  }
];
const BUTTON_HOVER = { y: -1, scale: 1.01 };
const BUTTON_TAP = { scale: 0.985 };

const FALLBACK_REFERRER_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#c8d3ea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg>`
)}`;
const FALLBACK_COUNTRY_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#c8d3ea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg>`
)}`;
const FALLBACK_OS_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#c8d3ea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 20h8"/></svg>`
)}`;
const COUNTRY_CODE_OVERRIDES: Record<string, string> = {
  "united states": "US",
  "united states of america": "US",
  "united kingdom": "GB",
  uk: "GB"
};
const OPERATING_SYSTEM_ICON_URL_BY_NAME: Record<string, string> = {
  windows: "https://cdn.simpleicons.org/windows/00A4EF",
  android: "https://cdn.simpleicons.org/android/3DDC84",
  ios: "https://cdn.simpleicons.org/apple/ECECEC",
  "gnu/linux": "https://cdn.simpleicons.org/linux/ECECEC",
  linux: "https://cdn.simpleicons.org/linux/ECECEC",
  mac: "https://cdn.simpleicons.org/apple/ECECEC",
  macos: "https://cdn.simpleicons.org/apple/ECECEC"
};

const COUNTRY_NAME_TO_CODE = (() => {
  const map = new Map<string, string>();

  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (const first of letters) {
      for (const second of letters) {
        const code = `${first}${second}`;
        const name = display.of(code);
        if (name && name !== code) {
          map.set(name.toLowerCase(), code);
        }
      }
    }
  } catch {
    // ignore unsupported runtimes
  }

  return map;
})();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/login";
    }
    throw new Error("Sessao expirada.");
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

function chartValueFormatter(value: number): string {
  return formatInteger(Math.max(0, Math.round(value)));
}

function resolveCountryCode(countryName: string): string | null {
  const normalized = countryName.trim().toLowerCase();
  if (!normalized || normalized === "unknown") {
    return null;
  }

  if (/^[A-Z]{2}$/.test(countryName)) {
    return countryName.toUpperCase();
  }

  const override = COUNTRY_CODE_OVERRIDES[normalized];
  if (override) {
    return override;
  }

  const code = COUNTRY_NAME_TO_CODE.get(normalized);
  return code ?? null;
}

function resolveCountryIconUrl(countryName: string): string {
  const code = resolveCountryCode(countryName);
  if (!code) {
    return FALLBACK_COUNTRY_ICON;
  }

  return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
}

function normalizeReferrerHost(name: string): string | null {
  const value = name.trim().toLowerCase();
  if (!value || value === "direct") {
    return null;
  }

  if (value === "com.reddit.frontpage") {
    return "reddit.com";
  }

  if (value.endsWith(".instagram.com")) {
    return "instagram.com";
  }

  if (value.endsWith(".facebook.com")) {
    return "facebook.com";
  }

  return value;
}

function resolveReferrerIconUrl(name: string): string {
  const host = normalizeReferrerHost(name);
  if (!host) {
    return FALLBACK_REFERRER_ICON;
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
}

function renderCompactRows(items: ExplorerBreakdownItem[], isPercent = true) {
  if (items.length === 0) {
    return <p className="panel-muted">No data yet.</p>;
  }

  return items.map((item) => (
    <div className="list-row" key={item.name}>
      <span className="list-label">{item.name}</span>
      <span className="list-value">{isPercent ? formatPercent(item.percent) : formatInteger(item.visitors)}</span>
    </div>
  ));
}

function renderCountryRows(items: ExplorerBreakdownItem[]) {
  if (items.length === 0) {
    return <p className="panel-muted">No data yet.</p>;
  }

  return items.map((item) => (
    <div className="list-row" key={item.name}>
      <span className="country-label">
        <span className="country-flag-wrap" aria-hidden>
          <img
            className="country-flag-icon"
            src={resolveCountryIconUrl(item.name)}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied === "1") {
                return;
              }

              event.currentTarget.dataset.fallbackApplied = "1";
              event.currentTarget.src = FALLBACK_COUNTRY_ICON;
            }}
          />
        </span>
        <span className="list-label country-name">{item.name}</span>
      </span>
      <span className="list-value">{formatPercent(item.percent)}</span>
    </div>
  ));
}

function renderEventRows(items: ExplorerEventItem[]) {
  if (items.length === 0) {
    return <p className="panel-muted">No events tracked yet.</p>;
  }

  return items.map((item) => (
    <div className="list-row two-values" key={item.eventName}>
      <span className="list-label code">{item.eventName}</span>
      <div className="list-values">
        <span>{formatInteger(item.visitors)} visitors</span>
        <span>{formatInteger(item.total)} total</span>
      </div>
    </div>
  ));
}

function renderPageRows(items: Array<{ path: string; views: number; uniqueVisitors: number }>) {
  if (items.length === 0) {
    return <p className="panel-muted">No routes yet.</p>;
  }

  return items.map((item) => (
    <div className="list-row two-values" key={item.path}>
      <span className="list-label code">{item.path}</span>
      <div className="list-values">
        <span>{formatInteger(item.uniqueVisitors)} visitors</span>
        <span>{formatInteger(item.views)} views</span>
      </div>
    </div>
  ));
}

function renderDownloadAttributionRows(items: DownloadAttributionItem[]) {
  if (items.length === 0) {
    return <p className="panel-muted">No download click data yet.</p>;
  }

  return items.map((item) => (
    <div className="list-row two-values" key={`${item.path}-${item.channel}`}>
      <span className="list-label code">{item.path}</span>
      <div className="list-values">
        <span>button: {item.channel}</span>
        <span>{formatInteger(item.totalDownloads)} downloads</span>
        <span>{formatInteger(item.uniqueVisitors)} usuarios</span>
      </div>
    </div>
  ));
}

function normalizeOperatingSystemName(name: string): string {
  return name.trim().toLowerCase();
}

function resolveOperatingSystemIconUrl(name: string): string {
  const normalized = normalizeOperatingSystemName(name);
  if (!normalized || normalized === "unknown") {
    return FALLBACK_OS_ICON;
  }

  const iconUrl = OPERATING_SYSTEM_ICON_URL_BY_NAME[normalized];
  return iconUrl ?? FALLBACK_OS_ICON;
}

function renderOperatingSystemRows(items: ExplorerBreakdownItem[]) {
  if (items.length === 0) {
    return <p className="panel-muted">No data yet.</p>;
  }

  return items.map((item) => (
    <div className="list-row" key={item.name}>
      <span className="os-label">
        <span className="os-icon-wrap" aria-hidden>
          <img
            className="os-icon-image"
            src={resolveOperatingSystemIconUrl(item.name)}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied === "1") {
                return;
              }

              event.currentTarget.dataset.fallbackApplied = "1";
              event.currentTarget.src = FALLBACK_OS_ICON;
            }}
          />
        </span>
        <span className="list-label os-name">{item.name}</span>
      </span>
      <span className="list-value">{formatPercent(item.percent)}</span>
    </div>
  ));
}

function renderTopRows(items: Array<{ name: string; visitors: number }>) {
  if (items.length === 0) {
    return <p className="panel-muted">No sources detected.</p>;
  }

  return items.map((item) => (
    <div className="list-row" key={item.name}>
      <span className="list-label">{item.name}</span>
      <span className="list-value">{formatInteger(item.visitors)}</span>
    </div>
  ));
}

function renderReferrerRows(items: Array<{ name: string; visitors: number }>) {
  if (items.length === 0) {
    return <p className="panel-muted">No sources detected.</p>;
  }

  return items.map((item) => (
    <div className="list-row" key={item.name}>
      <span className="referrer-label">
        <span className="referrer-icon-wrap">
          <img
            className="referrer-icon"
            src={resolveReferrerIconUrl(item.name)}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied === "1") {
                return;
              }

              event.currentTarget.dataset.fallbackApplied = "1";
              event.currentTarget.src = FALLBACK_REFERRER_ICON;
            }}
          />
        </span>
        <span className="list-label referrer-name">{item.name}</span>
      </span>
      <span className="list-value">{formatInteger(item.visitors)}</span>
    </div>
  ));
}

export function DashboardShell() {
  const [range, setRange] = useState<RangeOption>("7d");
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>("pages");
  const [acquisitionTab, setAcquisitionTab] = useState<AcquisitionTab>("referrers");
  const [deviceTab, setDeviceTab] = useState<DeviceTab>("devices");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [data, setData] = useState<ExplorerResponse["explorer"] | null>(null);
  const [downloadAttribution, setDownloadAttribution] = useState<DownloadAttributionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const exportCsv = useCallback((block: CsvExportBlock) => {
    if (typeof window === "undefined") {
      return;
    }

    setIsDownloadModalOpen(false);
    const target = `/api/v1/metrics/export?block=${block}&range=${range}&limit=200`;
    window.location.href = target;
  }, [range]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/v1/auth/logout", { method: "POST", cache: "no-store" }).catch(() => null);
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/login";
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [explorerResponse, downloadAttributionResponse] = await Promise.all([
          fetchJson<ExplorerResponse>(`/api/v1/metrics/explorer?range=${range}&limit=8`),
          fetchJson<DownloadAttributionResponse>(
            `/api/v1/metrics/page-funnel?range=${range}&limit=10`
          )
        ]);

        if (!cancelled) {
          setData(explorerResponse.explorer);
          setDownloadAttribution(downloadAttributionResponse.downloads);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Failed to load dashboard.");
          setDownloadAttribution([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [range]);

  useEffect(() => {
    if (!isDownloadModalOpen || typeof window === "undefined") {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDownloadModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isDownloadModalOpen]);

  const points: ExplorerSeriesPoint[] = data?.points ?? [];

  const primaryRows = useMemo(() => {
    if (!data) {
      return [];
    }

    if (primaryTab === "routes") {
      return renderPageRows(data.routes);
    }

    if (primaryTab === "hostnames") {
      return renderCompactRows(data.hostnames, false);
    }

    return renderPageRows(data.pages);
  }, [data, primaryTab]);

  const acquisitionRows = useMemo(() => {
    if (!data) {
      return [];
    }

    if (acquisitionTab === "utm") {
      return renderTopRows(data.utmParameters);
    }

    return renderReferrerRows(data.referrers);
  }, [acquisitionTab, data]);
  const totalDownloads = data?.events.find((event) => event.eventName === "download_click")?.total ?? 0;

  return (
    <div className="vercel-shell">
      <header className="topbar glass">
        <div className="project-pill">
          <span className="project-logo-wrap" aria-hidden>
            <img className="project-logo" src="/icon.png" alt="" loading="eager" decoding="async" />
          </span>
          <span className="dot" />
          <span>animecaos.vercel.app</span>
          <span className="online">
            {isLoading ? "..." : formatInteger(data?.activeUsersLast5Minutes ?? 0)} online (5 min)
          </span>
        </div>

        <div className="toolbar">
          <motion.button
            type="button"
            className="ghost-btn"
            whileHover={BUTTON_HOVER}
            whileTap={BUTTON_TAP}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            Production
          </motion.button>
          <motion.button
            type="button"
            className="ghost-btn"
            onClick={() => setIsDownloadModalOpen(true)}
            whileHover={BUTTON_HOVER}
            whileTap={BUTTON_TAP}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            Download
          </motion.button>
          <motion.button
            type="button"
            className="ghost-btn logout-btn"
            onClick={handleLogout}
            whileHover={BUTTON_HOVER}
            whileTap={BUTTON_TAP}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            Sair
          </motion.button>
          <div className="segmented" role="tablist" aria-label="Time range">
            {(Object.keys(RANGE_LABELS) as RangeOption[]).map((option) => (
              <motion.button
                key={option}
                type="button"
                className={`segment-btn ${range === option ? "active" : ""}`}
                onClick={() => setRange(option)}
                whileHover={{ y: -1 }}
                whileTap={BUTTON_TAP}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                {RANGE_LABELS[option]}
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {data?.isSynthetic ? (
        <div className="synthetic-banner glass">No live events found in this range. Showing generated analytics preview.</div>
      ) : null}

      {error ? <div className="synthetic-banner glass error">{error}</div> : null}

      <section className="kpi-grid glass">
        <article className="kpi-item">
          <p>Visitors</p>
          <strong>{isLoading ? "..." : formatInteger(data?.visitors ?? 0)}</strong>
        </article>
        <article className="kpi-item">
          <p>Page Views</p>
          <strong>{isLoading ? "..." : formatInteger(data?.pageViews ?? 0)}</strong>
        </article>
        <article className="kpi-item">
          <p>Total Downloads</p>
          <strong>{isLoading ? "..." : formatInteger(totalDownloads)}</strong>
        </article>
        <article className="kpi-item">
          <p>Bounce Rate</p>
          <strong>{isLoading ? "..." : formatPercent(data?.bounceRate ?? 0)}</strong>
        </article>
      </section>

      <section className="chart-card glass">
        <div className="panel-title-row">
          <h2>Traffic</h2>
          <span>{RANGE_LABELS[range]}</span>
        </div>
        <div className="chart-wrap">
          {isLoading ? (
            <p className="panel-muted">Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points}>
                <defs>
                  <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(50, 205, 50, 0.24)" />
                    <stop offset="100%" stopColor="rgba(50, 205, 50, 0.02)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={humanizeDate}
                  stroke="rgba(255,255,255,0.45)"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.45)"
                  tickFormatter={chartValueFormatter}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [formatInteger(value), name]}
                  labelFormatter={(label) => humanizeDate(String(label))}
                  contentStyle={{
                    background: "rgba(8,10,15,0.95)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  name="Page Views"
                  stroke="#32cd32"
                  fill="url(#pvGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="grid two">
        <article className="panel-card glass">
          <div className="panel-title-row">
            <div className="tabs">
              <motion.button
                type="button"
                className={primaryTab === "pages" ? "active" : ""}
                onClick={() => setPrimaryTab("pages")}
                whileHover={{ y: -1 }}
                whileTap={BUTTON_TAP}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                Pages
              </motion.button>
              <motion.button
                type="button"
                className={primaryTab === "routes" ? "active" : ""}
                onClick={() => setPrimaryTab("routes")}
                whileHover={{ y: -1 }}
                whileTap={BUTTON_TAP}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                Routes
              </motion.button>
              <motion.button
                type="button"
                className={primaryTab === "hostnames" ? "active" : ""}
                onClick={() => setPrimaryTab("hostnames")}
                whileHover={{ y: -1 }}
                whileTap={BUTTON_TAP}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                Hostnames
              </motion.button>
            </div>
          </div>
          <div className="list-wrap">{primaryRows}</div>
        </article>

        <article className="panel-card glass">
          <div className="panel-title-row">
            <div className="tabs">
              <motion.button
                type="button"
                className={acquisitionTab === "referrers" ? "active" : ""}
                onClick={() => setAcquisitionTab("referrers")}
                whileHover={{ y: -1 }}
                whileTap={BUTTON_TAP}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                Referrers
              </motion.button>
              <motion.button
                type="button"
                className={acquisitionTab === "utm" ? "active" : ""}
                onClick={() => setAcquisitionTab("utm")}
                whileHover={{ y: -1 }}
                whileTap={BUTTON_TAP}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                UTM Parameters
              </motion.button>
            </div>
          </div>
          <div className="list-wrap">{acquisitionRows}</div>
        </article>
      </section>

      <section className="grid three">
        <article className="panel-card glass">
          <div className="panel-title-row"><h3>Countries</h3></div>
          <div className="list-wrap">{renderCountryRows(data?.countries ?? [])}</div>
        </article>

        <article className="panel-card glass">
          <div className="panel-title-row">
            <div className="tabs">
              <motion.button
                type="button"
                className={deviceTab === "devices" ? "active" : ""}
                onClick={() => setDeviceTab("devices")}
                whileHover={{ y: -1 }}
                whileTap={BUTTON_TAP}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                Devices
              </motion.button>
              <motion.button
                type="button"
                className={deviceTab === "browsers" ? "active" : ""}
                onClick={() => setDeviceTab("browsers")}
                whileHover={{ y: -1 }}
                whileTap={BUTTON_TAP}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                Browsers
              </motion.button>
            </div>
          </div>
          <div className="list-wrap">
            {deviceTab === "devices"
              ? renderCompactRows(data?.devices ?? [])
              : renderCompactRows(data?.browsers ?? [])}
          </div>
        </article>

        <article className="panel-card glass">
          <div className="panel-title-row"><h3>Operating Systems</h3></div>
          <div className="list-wrap">{renderOperatingSystemRows(data?.operatingSystems ?? [])}</div>
        </article>
      </section>

      <section className="grid two">
        <article className="panel-card glass">
          <div className="panel-title-row"><h3>Events</h3></div>
          <div className="list-wrap">{renderEventRows(data?.events ?? [])}</div>
        </article>

        <article className="panel-card glass">
          <div className="panel-title-row">
            <h3>Downloads por Pagina e Botao (download_click)</h3>
          </div>
          <div className="list-wrap">{renderDownloadAttributionRows(downloadAttribution)}</div>
        </article>
      </section>

      <AnimatePresence>
        {isDownloadModalOpen ? (
          <motion.div
            className="download-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onClick={() => setIsDownloadModalOpen(false)}
          >
            <motion.section
              className="download-modal glass"
              role="dialog"
              aria-modal="true"
              aria-labelledby="download-modal-title"
              initial={{ opacity: 0, y: 8, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.985 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="download-modal-head">
                <div>
                  <p className="download-modal-kicker">Export</p>
                  <h3 id="download-modal-title">Download CSV</h3>
                </div>
                <motion.button
                  type="button"
                  className="download-modal-close"
                  onClick={() => setIsDownloadModalOpen(false)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={BUTTON_TAP}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                >
                  Fechar
                </motion.button>
              </div>
              <p className="download-modal-subtitle">
                Selecione o bloco que voce quer exportar para CSV.
              </p>
              <div className="download-modal-grid">
                {DOWNLOAD_OPTIONS.map((option) => (
                  <motion.button
                    key={option.block}
                    type="button"
                    className="download-option-btn"
                    onClick={() => exportCsv(option.block)}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={BUTTON_TAP}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    <span className="download-option-title">{option.title}</span>
                    <span className="download-option-desc">{option.description}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

