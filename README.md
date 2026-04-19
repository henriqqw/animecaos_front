# AnimeCaos — Frontend

Landing page e frontpage do [AnimeCaos](https://animecaos.xyz), construída com Next.js.

## Estrutura

```text
frontpage/   # landing page (marketing, tracking client/proxy, SEO)
```

## Frontpage

Next.js 16 + React 19 + TypeScript. Responsável por:

- apresentar o app e direcionar downloads;
- capturar eventos (`page_view`, `download_click`, `first_open`, `pwa_installed`);
- suporte a PT/EN com `next-intl`, sitemap e JSON-LD.

### Rodando localmente

```bash
cd frontpage
npm install
npm run dev
```

### Variáveis de ambiente

- `ANALYTICS_ENDPOINT`
- `ANALYTICS_WRITE_KEY`
