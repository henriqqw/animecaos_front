# Analytics First-Party

Dashboard first-party para medir visitas, cliques de download e instalacoes sem Google Analytics/Firebase.

## Stack
- Next.js (React + TypeScript)
- Armazenamento first-party em arquivo append-only (`NDJSON`)
- Recharts para visualizacao
- API Route Handlers para ingestao e consultas

## Arquitetura (Clean + SOLID)
```
src/
  domain/
    events/
      types.ts
      EventRepository.ts
  application/
    use-cases/
      TrackEventUseCase.ts
      GetOverviewMetricsUseCase.ts
      GetTimeseriesUseCase.ts
      GetFunnelMetricsUseCase.ts
      GetTopPagesUseCase.ts
  infrastructure/
    db/fileStore.ts
    repositories/FileEventRepository.ts
    container.ts
  interface/
    http/
      validators.ts
      requestMeta.ts
      http.ts
  app/
    api/v1/...
    dashboard/page.tsx
```

Principios aplicados:
- SRP: cada camada faz uma coisa (dominio, casos de uso, persistencia, HTTP/UI).
- OCP: novas metricas/eventos entram com novos casos de uso/repositorio sem quebrar controllers.
- LSP/ISP: `EventRepository` separa contrato do storage.
- DIP: use cases dependem de interface, nao de SQLite diretamente.

## Eventos suportados
- `page_view`
- `download_click`
- `pwa_installed`
- `first_open`

Obs.: eventos classificados como bot sao armazenados, mas excluidos das metricas do dashboard.

## API

### `POST /api/v1/events`
Body:
```json
{
  "eventName": "download_click",
  "visitorId": "visitor-123",
  "sessionId": "session-123",
  "path": "/",
  "metadata": {
    "channel": "hero-cta"
  }
}
```

Header opcional:
- `X-Analytics-Key: <ANALYTICS_WRITE_KEY>`

### `GET /api/v1/metrics/overview?range=30d`
### `GET /api/v1/metrics/timeseries?range=30d`
### `GET /api/v1/metrics/funnel?range=30d`
### `GET /api/v1/metrics/page-funnel?range=30d&limit=10`
### `GET /api/v1/metrics/top-pages?range=30d&limit=8`
### `GET /api/v1/metrics/export?range=30d&block=pages`

Blocos suportados no export CSV:
- `pages`
- `referrers`
- `countries`
- `events`

Auth dashboard:
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`

`range`: `7d`, `30d` ou `90d`.

## Variaveis de ambiente
Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

- `DATABASE_PATH`: caminho do arquivo `NDJSON`.
- `VERCEL_BASELINE_PATH`: caminho do `vercel-baseline.json` (opcional, default busca em `./config`, `./dashboard/config`, `./data` e `./dashboard/data`).
- `ANALYTICS_WRITE_KEY`: chave para proteger ingestao.
- `TRACKING_ALLOWED_ORIGINS`: origens permitidas, separado por virgula ou `*`.
- `VISITOR_HASH_SALT`: salt para derivar visitor id quando cliente nao envia.
- `DASHBOARD_AUTH_USERNAME`: usuario para login do dashboard.
- `DASHBOARD_AUTH_PASSWORD_HASH`: hash da senha (formato `scrypt$N$r$p$salt$hash`).
- `DASHBOARD_SESSION_SECRET`: segredo para criptografar cookie de sessao.
- `DASHBOARD_SESSION_TTL_SECONDS`: TTL da sessao em segundos.
- `DASHBOARD_SESSION_COOKIE_SECURE`: `true` em producao HTTPS; `false` em dev HTTP.
- `DASHBOARD_AUTH_ALLOWED_ORIGINS`: opcional, allowlist de origem para login/logout.

Gerar hash de senha:
```bash
npm run auth:hash -- "sua-senha-forte"
```

### Baseline da Vercel
O arquivo `config/vercel-baseline.json` pode definir um snapshot inicial da Vercel para a dashboard iniciar com esses valores.

- `capturedAt` (ISO UTC) define o corte: eventos locais com `occurredAt <= capturedAt` sao ignorados.
- Eventos depois de `capturedAt` sao somados ao baseline.

## Rodar local
```bash
npm install
npm run dev
```

Dashboard:
- `http://localhost:3000/dashboard`
- login em `http://localhost:3000/dashboard/login`

## Integrar com landing page
Use o snippet em [docs/tracker-snippet.ts](docs/tracker-snippet.ts).

No minimo, envie:
- `page_view` ao carregar rota
- `download_click` no CTA
- `first_open` quando detectar instalacao/primeira abertura

## Deploy em VPS (Ubuntu)
### 1) Instalar Node 22 e Nginx
```bash
sudo apt update
sudo apt install -y curl gnupg ca-certificates nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs build-essential
```

### 2) Preparar app
```bash
mkdir -p ~/apps
cd ~/apps
git clone <SEU_REPO_GIT> analytics-first-party
cd analytics-first-party
cp .env.example .env
npm install
npm run build
```

### 3) Rodar com PM2
```bash
sudo npm install -g pm2
pm2 start npm --name analytics-first-party -- start
pm2 save
pm2 startup
```

### 4) Reverse proxy com Nginx
Arquivo `/etc/nginx/sites-available/analytics-first-party`:
```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/analytics-first-party /etc/nginx/sites-enabled/analytics-first-party
sudo nginx -t
sudo systemctl restart nginx
```

## Checklist de producao
- Definir `ANALYTICS_WRITE_KEY` forte.
- Definir `VISITOR_HASH_SALT` unico.
- Restringir `TRACKING_ALLOWED_ORIGINS`.
- Ativar TLS (certbot) antes de ir para trafego real.
- Fazer backup diario do arquivo de eventos (`data/events.ndjson`).
