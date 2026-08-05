"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LatestRelease, DownloadsResponse, ReleaseChangelog } from "@/app/api/github-downloads/route";

const FALLBACK_URL =
  "https://github.com/henriqqw/AnimeCaos/releases/download/v2.0.0/Setup_AnimeCaos_v2.0.0.exe";

const FALLBACK_RELEASE: LatestRelease = {
  tag: "v2.0.0",
  version: "2.0.0",
  windows_url: FALLBACK_URL,
  changelog: [],
};

const FALLBACK_CHANGELOGS: ReleaseChangelog[] = [
  {
    tag: "v2.0.0",
    date: "2026-08-05T00:00:00Z",
    items: [
      "Minha Lista: nova página de watchlist pessoal — adicione/remova animes direto da home, da busca ou da página de detalhes",
      "Preview ao passar o mouse (estilo Crunchyroll): hover expande card com nota, temporada, episódios e sinopse reais da AniList",
      "Manga: navegação, busca e leitura offline de capítulos já baixados",
      "Integração AniList completa (login, sincronização de progresso) e Discord Rich Presence",
      "Home redesenhada: spotlight da temporada, seções 'Em Alta' e 'Temporada Atual' com scroll horizontal",
      "Qualidade de vídeo do AnimeFire sempre escolhe a melhor resolução disponível por episódio (1080p > 720p > 360p)",
      "Corrigida listagem de episódios incorreta em animes com muitos episódios (ex. One Piece, 1172 episódios)",
    ],
  },
  {
    tag: "v0.1.3",
    date: "2026-04-17T00:00:00Z",
    items: [
      "Conta AniList: sincronização automática de episódios assistidos, animes concluídos e tempo total",
      "Discord Rich Presence: status exibe anime e episódio atual com timer durante reprodução",
      "Player mais rápido: cache e prefetch reduzem tempo de início para ~5 segundos",
      "Interface de Conta redesenhada com layout lado a lado e animações suaves",
    ],
  },
  {
    tag: "v0.1.2",
    date: "2026-03-16T00:00:00Z",
    items: [
      "Capas dinâmicas: placeholder com gradiente e cor única por anime enquanto a capa real carrega",
      "Download Manager: popup com progresso, velocidade, ETA, tela de conclusão e botão cancelar",
      "Navegação por botões laterais do mouse com histórico completo",
      "Tela de boas-vindas na busca com ícone e atalhos de teclado",
      "Repositório de animes expandido com muito mais títulos disponíveis",
    ],
  },
  {
    tag: "v0.1.1",
    date: "2026-03-10T00:00:00Z",
    items: [
      "Atualização automática: o app verifica e instala novas versões automaticamente",
      "Histórico e watchlist preservados entre atualizações e reinstalações",
      "Capas voltaram a ser baixadas e exibidas corretamente no painel de detalhes",
      "Plugin BetterAnime removido — site permanentemente offline",
    ],
  },
  {
    tag: "v0.1.0",
    date: "2025-12-01T00:00:00Z",
    items: [
      "Painel de Controle AniList: capa original e sinopse em português ao selecionar um anime",
      "Watchlist: favorite animes no Painel de Controle, salvo localmente em watchlist.json",
      "Downloads via yt-dlp em background com progresso no Painel de Eventos",
      "Auto-Play: intercepta sinal de fim do mpv e avança automaticamente para o próximo episódio",
    ],
  },
];

interface ReleaseContextValue {
  release: LatestRelease;
  changelogs: ReleaseChangelog[];
}

const ReleaseContext = createContext<ReleaseContextValue>({
  release: FALLBACK_RELEASE,
  changelogs: FALLBACK_CHANGELOGS,
});

export function ReleaseProvider({ children }: { children: ReactNode }) {
  const [release, setRelease] = useState<LatestRelease>(FALLBACK_RELEASE);
  const [changelogs, setChangelogs] = useState<ReleaseChangelog[]>(FALLBACK_CHANGELOGS);

  useEffect(() => {
    fetch("/api/github-downloads")
      .then((r) => r.json())
      .then((d: DownloadsResponse) => {
        if (d.latest) setRelease(d.latest);
        if (d.changelogs?.length) {
          const apiTags = new Set(d.changelogs.map((c) => c.tag));
          const merged = [
            ...d.changelogs,
            ...FALLBACK_CHANGELOGS.filter((c) => !apiTags.has(c.tag)),
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setChangelogs(merged);
        }
      })
      .catch(() => null);
  }, []);

  return (
    <ReleaseContext.Provider value={{ release, changelogs }}>
      {children}
    </ReleaseContext.Provider>
  );
}

export function useRelease(): LatestRelease {
  return useContext(ReleaseContext).release;
}

export function useChangelogs(): ReleaseChangelog[] {
  return useContext(ReleaseContext).changelogs;
}
