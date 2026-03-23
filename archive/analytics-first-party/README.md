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
### `GET /api/v1/metrics/top-pages?range=30d&limit=8`

`range`: `7d`, `30d` ou `90d`.

## Variaveis de ambiente
Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

- `DATABASE_PATH`: caminho do arquivo `NDJSON`.
- `ANALYTICS_WRITE_KEY`: chave para proteger ingestao.
- `TRACKING_ALLOWED_ORIGINS`: origens permitidas, separado por virgula ou `*`.
- `VISITOR_HASH_SALT`: salt para derivar visitor id quando cliente nao envia.

## Rodar local
```bash
npm install
npm run dev
```

Dashboard:
- `http://localhost:3000/dashboard`

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
