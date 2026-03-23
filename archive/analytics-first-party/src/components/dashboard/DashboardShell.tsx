"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { FunnelMetric } from "@/domain/events/types";
import { formatInteger, formatPercent, humanizeDate } from "@/shared/format";

import type {
  FunnelResponse,
  OverviewResponse,
  TimeseriesResponse,
  TopPagesResponse
} from "./types";

type RangeOption = "7d" | "30d" | "90d";

interface DashboardState {
  overview: OverviewResponse["overview"] | null;
  points: TimeseriesResponse["points"];
  funnel: FunnelMetric[];
  pages: TopPagesResponse["pages"];
}

const EMPTY_STATE: DashboardState = {
  overview: null,
  points: [],
  funnel: [],
  pages: []
};

const RANGE_LABELS: Record<RangeOption, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias"
};

const FUNNEL_STEP_LABELS: Record<FunnelMetric["step"], string> = {
  visit: "Visitas",
  click: "Cliques",
  install: "Instalações"
};

const FUNNEL_COLORS = ["#27d980", "#2db1ff", "#ffb648"];

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

function summarizeFunnel(funnel: FunnelMetric[]) {
  return funnel.map((item) => ({
    ...item,
    label: FUNNEL_STEP_LABELS[item.step]
  }));
}

export function DashboardShell() {
  const [range, setRange] = useState<RangeOption>("30d");
  const [state, setState] = useState<DashboardState>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [overviewResponse, timeseriesResponse, funnelResponse, topPagesResponse] =
          await Promise.all([
            fetchJson<OverviewResponse>(`/api/v1/metrics/overview?range=${range}`),
            fetchJson<TimeseriesResponse>(`/api/v1/metrics/timeseries?range=${range}`),
            fetchJson<FunnelResponse>(`/api/v1/metrics/funnel?range=${range}`),
            fetchJson<TopPagesResponse>(`/api/v1/metrics/top-pages?range=${range}&limit=8`)
          ]);

        if (cancelled) {
          return;
        }

        setState({
          overview: overviewResponse.overview,
          points: timeseriesResponse.points,
          funnel: funnelResponse.funnel,
          pages: topPagesResponse.pages
        });
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Nao foi possivel carregar a dashboard.";
        setError(message);
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

  const funnelChartData = useMemo(() => summarizeFunnel(state.funnel), [state.funnel]);

  const cards = useMemo(() => {
    const overview = state.overview;
    if (!overview) {
      return [];
    }

    return [
      {
        title: "Visitantes unicos",
        value: formatInteger(overview.uniqueVisitors),
        subtitle: "Pessoas distintas no periodo"
      },
      {
        title: "Visualizacoes",
        value: formatInteger(overview.pageViews),
        subtitle: "Total de page views registradas"
      },
      {
        title: "Cliques em download",
        value: formatInteger(overview.downloadClicks),
        subtitle: `CTR: ${formatPercent(overview.clickThroughRate)}`
      },
      {
        title: "Instalacoes",
        value: formatInteger(overview.installs),
        subtitle: `Click -> Install: ${formatPercent(overview.installRateFromClicks)}`
      }
    ];
  }, [state.overview]);

  return (
    <div className="dashboard-root">
      <header className="hero">
        <div>
          <p className="hero-tag">First-Party Analytics</p>
          <h1 className="hero-title">Animecaos Growth Command Center</h1>
          <p className="hero-subtitle">
            Todas as metricas de aquisicao em um painel proprio, sem Google/Firebase.
          </p>
        </div>

        <div className="range-switch" role="tablist" aria-label="Periodo da analise">
          {(Object.keys(RANGE_LABELS) as RangeOption[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`range-btn ${range === option ? "active" : ""}`}
              onClick={() => setRange(option)}
            >
              {RANGE_LABELS[option]}
            </button>
          ))}
        </div>
      </header>

      {error ? (
        <section className="panel error-panel">
          <strong>Falha ao carregar dados</strong>
          <p>{error}</p>
        </section>
      ) : null}

      <section className="cards-grid">
        {cards.map((card) => (
          <article className="metric-card" key={card.title}>
            <p className="metric-label">{card.title}</p>
            <p className="metric-value">{card.value}</p>
            <p className="metric-subtitle">{card.subtitle}</p>
          </article>
        ))}
      </section>

      <section className="charts-grid">
        <article className="panel chart-panel wide">
          <div className="panel-header">
            <h2>Evolucao diaria</h2>
            <span>{RANGE_LABELS[range]}</span>
          </div>
          <div className="chart-body">
            {isLoading ? (
              <p className="panel-muted">Carregando grafico...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={state.points}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255, 255, 255, 0.12)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={humanizeDate}
                    tick={{ fill: "rgba(255,255,255,0.76)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.76)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#151726",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: "12px",
                      color: "#fff"
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="uniqueVisitors"
                    name="Visitantes"
                    stroke="#2bd9a7"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="pageViews"
                    name="Page Views"
                    stroke="#2ea8ff"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="downloadClicks"
                    name="Cliques Download"
                    stroke="#ffd45d"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-header">
            <h2>Funil de aquisicao</h2>
          </div>
          <div className="chart-body">
            {isLoading ? (
              <p className="panel-muted">Carregando funil...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelChartData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255, 255, 255, 0.12)" />
                  <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.76)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.76)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => [formatInteger(value), "Visitantes"]}
                    contentStyle={{
                      backgroundColor: "#151726",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: "12px",
                      color: "#fff"
                    }}
                  />
                  <Bar dataKey="visitors" radius={[10, 10, 0, 0]}>
                    {funnelChartData.map((entry, index) => (
                      <Cell
                        key={entry.label}
                        fill={FUNNEL_COLORS[index] ?? "#8b9bd9"}
                        fillOpacity={0.92}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="funnel-notes">
            {funnelChartData.map((item) => (
              <p key={item.step}>
                <strong>{item.label}:</strong>{" "}
                {formatPercent(item.conversionFromPreviousStep)} de conversao da etapa anterior.
              </p>
            ))}
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-header">
            <h2>Top paginas</h2>
          </div>
          <div className="pages-list">
            {state.pages.length === 0 ? (
              <p className="panel-muted">Sem dados ainda. Assim que entrar trafego, elas aparecem aqui.</p>
            ) : (
              state.pages.map((page) => (
                <div className="page-row" key={page.path}>
                  <div>
                    <p className="page-path">{page.path}</p>
                    <p className="page-meta">
                      {formatInteger(page.uniqueVisitors)} visitantes unicos
                    </p>
                  </div>
                  <p className="page-views">{formatInteger(page.views)} views</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

