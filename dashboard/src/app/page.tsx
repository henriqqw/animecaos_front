import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-root">
      <div className="home-card">
        <p className="home-badge">
          <img className="brand-inline-icon" src="/icon.png" alt="" loading="eager" decoding="async" />
          <span>Analytics First-Party</span>
        </p>
        <h1>Painel pronto para uso</h1>
        <p>
          A coleta e visualizacao de metricas esta ativa neste projeto sem depender de Google,
          Firebase ou provedores de tracking.
        </p>
        <div className="home-links">
          <Link href="/dashboard" className="home-link primary">
            Abrir dashboard
          </Link>
          <Link href="/api/v1/health" className="home-link">
            Testar API
          </Link>
        </div>
      </div>
    </main>
  );
}
