import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getCaosdevAscii } from "@/shared/branding/getCaosdevAscii";
import {
  getDashboardAuthConfigError,
  isDashboardAuthConfigured,
  readDashboardSessionFromCookiesStore
} from "@/security/dashboardAuth";

export default async function DashboardLoginPage() {
  const configured = isDashboardAuthConfigured();
  if (configured) {
    const session = await readDashboardSessionFromCookiesStore();
    if (session) {
      redirect("/dashboard");
    }
  }
  const asciiArt = await getCaosdevAscii();

  return (
    <main className="auth-page">
      {asciiArt ? (
        <section className="ascii-floating auth-ascii-floating" aria-label="CaosDev ASCII">
          <pre className="ascii-art auth-ascii" aria-hidden>
            {asciiArt}
          </pre>
        </section>
      ) : null}
      <section className="auth-card glass">
        <p className="auth-badge">
          <img className="brand-inline-icon" src="/icon.png" alt="" loading="eager" decoding="async" />
          <span>AnimeCaos Dashboard</span>
        </p>
        <h1>Login</h1>

        <LoginForm
          configured={configured}
          configurationError={configured ? null : getDashboardAuthConfigError()}
        />

        <p className="auth-footnote">
          <Link href="/">Voltar para inicio</Link>
        </p>
      </section>
    </main>
  );
}
