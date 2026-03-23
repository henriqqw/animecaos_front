import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getCaosdevAscii } from "@/shared/branding/getCaosdevAscii";
import {
  isDashboardAuthConfigured,
  readDashboardSessionFromCookiesStore
} from "@/security/dashboardAuth";

export default async function DashboardPage() {
  if (!isDashboardAuthConfigured()) {
    redirect("/dashboard/login");
  }

  const session = await readDashboardSessionFromCookiesStore();
  if (!session) {
    redirect("/dashboard/login");
  }
  const asciiArt = await getCaosdevAscii();

  return (
    <main className="page-wrap">
      {asciiArt ? (
        <section className="ascii-floating" aria-label="CaosDev ASCII">
          <pre className="ascii-art" aria-hidden>
            {asciiArt}
          </pre>
        </section>
      ) : null}
      <DashboardShell />
    </main>
  );
}
