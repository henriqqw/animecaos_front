"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Github, Check, Copy, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRelease } from "@/lib/release/context";

const GITHUB_REPO = "https://github.com/henriqqw/AnimeCaos";

const LINUX_BUILD = `git clone https://github.com/henriqqw/AnimeCaos.git
cd AnimeCaos
chmod +x build-flatpak.sh
./build-flatpak.sh`;

const LINUX_RUN = `flatpak run com.animecaos.App`;

const MAC_INSTALL = `git clone https://github.com/henriqqw/animecaos.git
cd animecaos
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt`;

const MAC_RUN = `python3 main.py`;

const LABEL_STYLE: React.CSSProperties = {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "var(--text-subtle)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
};

const PILL_STYLE: React.CSSProperties = {
    fontSize: "0.73rem",
    fontWeight: 600,
    color: "var(--text-subtle)",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--border)",
    borderRadius: "999px",
    padding: "0.22rem 0.7rem",
    whiteSpace: "nowrap",
};

function LinuxGlyph({ size = 14 }: { size?: number }) {
    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
            <path d="M12 2C9.5 2 8 4 8 6.5c0 1.5.4 2.8 1 3.8-.8.5-1.5 1.3-1.8 2.2C6.4 13.8 6 15 6 16c0 1.5.5 2.8 1.5 3.8.5.5 1 .8 1.5 1H15c.5-.2 1-.5 1.5-1C17.5 18.8 18 17.5 18 16c0-1-.4-2.2-1.2-3.5-.3-.9-1-1.7-1.8-2.2.6-1 1-2.3 1-3.8C16 4 14.5 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="10" cy="8" r="1" fill="currentColor" />
            <circle cx="14" cy="8" r="1" fill="currentColor" />
            <path d="M10 13c-.8.3-1.5.8-2 1.5M14 13c.8.3 1.5.8 2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M9 19.5c-.5.3-1.2.5-2 .5M15 19.5c.5.3 1.2.5 2 .5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

function MacGlyph({ size = 14 }: { size?: number }) {
    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="currentColor" />
        </svg>
    );
}

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handle = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch { /* ignore */ }
    };
    return (
        <button type="button" onClick={handle} className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "0.4rem 0.7rem", flexShrink: 0 }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copiado!" : "Copiar"}
        </button>
    );
}

function CodeSection({ label, code, children }: { label: string; code: string; children: React.ReactNode }) {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", marginBottom: "0.6rem" }}>
                <p style={LABEL_STYLE}>{label}</p>
                <CopyBtn text={code} />
            </div>
            <div className="code-block" style={{ overflowX: "auto", whiteSpace: "pre" }}>{children}</div>
        </div>
    );
}

function ReqBox({ text }: { text: string }) {
    return (
        <div style={{
            background: "rgba(251, 191, 36, 0.06)",
            border: "1px solid rgba(251, 191, 36, 0.22)",
            borderRadius: "var(--radius)",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.55rem",
            fontSize: "0.85rem",
            color: "rgba(240, 245, 255, 0.85)",
            fontWeight: 500,
            lineHeight: 1.5,
        }}>
            <AlertTriangle size={15} style={{ color: "rgb(251, 191, 36)", flexShrink: 0, marginTop: "0.1rem" }} />
            {text}
        </div>
    );
}

export default function DownloadContent() {
    const t = useTranslations("download");
    const release = useRelease();
    const includes = t.raw("includes") as string[];

    return (
        <div style={{ position: "relative", zIndex: 1, paddingTop: "8rem", paddingBottom: "6rem" }}>
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: "3.5rem" }}
                >
                    <div className="badge" style={{ marginBottom: "1.25rem" }}>
                        <Download size={11} />
                        {t("version")} {release.tag}
                    </div>
                    <h1 className="heading-lg">{t("title")}</h1>
                </motion.div>

                {/* Platform cards — align-items: start so cards don't stretch to equal height */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", alignItems: "start" }}>

                    {/* === WINDOWS === */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="liquid-glass"
                        style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
                    >
                        {/* Platform label */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <div className="feature-icon" style={{ width: 28, height: 28, margin: 0, flexShrink: 0 }}>
                                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                                </svg>
                            </div>
                            <span style={LABEL_STYLE}>Windows</span>
                        </div>

                        {/* Title + subtitle — minHeight normalizes pill alignment across cards */}
                        <div style={{ minHeight: "5rem" }}>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.4rem" }}>AnimeCaos.exe</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t("sub")}</p>
                        </div>

                        {/* Spec pills */}
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            {["~90MB", "Windows 10/11", "Standalone"].map(s => (
                                <span key={s} style={PILL_STYLE}>{s}</span>
                            ))}
                        </div>

                        {/* Includes */}
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                            <p style={{ ...LABEL_STYLE, marginBottom: "0.9rem" }}>{t("includes_title")}</p>
                            <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem", listStyle: "none" }}>
                                {includes.map(text => (
                                    <li key={text} style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                                        <Check size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <a
                                href={release.windows_url ?? ""}
                                id="download-exe-btn"
                                data-umami-event="download_click"
                                data-umami-event-channel="download_page"
                                className="btn btn-primary"
                                style={{ justifyContent: "center", padding: "0.9rem 1.5rem" }}
                            >
                                <Download size={18} />
                                {t("btn")}
                            </a>
                            <ReqBox text={t("note")} />
                            <a
                                href={GITHUB_REPO}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-ghost"
                                style={{ fontSize: "0.875rem", justifyContent: "center" }}
                            >
                                <Github size={15} />
                                Ver no GitHub
                            </a>
                        </div>
                    </motion.div>

                    {/* === LINUX === */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="liquid-glass"
                        style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
                    >
                        {/* Platform label */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <div className="feature-icon" style={{ width: 28, height: 28, margin: 0, flexShrink: 0 }}>
                                <LinuxGlyph size={13} />
                            </div>
                            <span style={LABEL_STYLE}>Linux</span>
                        </div>

                        {/* Title + subtitle */}
                        <div style={{ minHeight: "5rem" }}>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.4rem" }}>{t("linux_title")}</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t("linux_sub")}</p>
                        </div>

                        {/* Spec pills */}
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            {["Ubuntu · Fedora · Arch", "Flatpak"].map(s => (
                                <span key={s} style={PILL_STYLE}>{s}</span>
                            ))}
                        </div>

                        {/* Commands */}
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <CodeSection label={t("linux_build_label")} code={LINUX_BUILD}>
                                <div><span className="cmd">git</span>{" clone https://github.com/henriqqw/AnimeCaos.git"}</div>
                                <div><span className="cmd">cd</span>{" AnimeCaos"}</div>
                                <div><span className="cmd">chmod</span>{" +x build-flatpak.sh"}</div>
                                <div><span className="cmd">{"./build-flatpak.sh"}</span></div>
                            </CodeSection>
                            <CodeSection label={t("linux_run_label")} code={LINUX_RUN}>
                                <div><span className="cmd">flatpak</span>{" run com.animecaos.App"}</div>
                            </CodeSection>
                        </div>

                        {/* CTA */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <ReqBox text={t("linux_note")} />
                            <a
                                href={GITHUB_REPO}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-ghost"
                                style={{ fontSize: "0.875rem", justifyContent: "center" }}
                            >
                                <Github size={15} />
                                Ver no GitHub
                            </a>
                        </div>
                    </motion.div>

                    {/* === macOS === */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="liquid-glass"
                        style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
                    >
                        {/* Platform label */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <div className="feature-icon" style={{ width: 28, height: 28, margin: 0, flexShrink: 0 }}>
                                <MacGlyph size={13} />
                            </div>
                            <span style={LABEL_STYLE}>macOS</span>
                        </div>

                        {/* Title + subtitle */}
                        <div style={{ minHeight: "5rem" }}>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.4rem" }}>{t("mac_title")}</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t("mac_sub")}</p>
                        </div>

                        {/* Spec pills */}
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            {["macOS 12+", "Python 3.10+"].map(s => (
                                <span key={s} style={PILL_STYLE}>{s}</span>
                            ))}
                        </div>

                        {/* Commands */}
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <CodeSection label={t("mac_install_label")} code={MAC_INSTALL}>
                                <div><span className="cmd">git</span>{" clone https://github.com/henriqqw/animecaos.git"}</div>
                                <div><span className="cmd">cd</span>{" animecaos"}</div>
                                <div><span className="cmd">python3</span>{" -m venv venv"}</div>
                                <div><span className="cmd">source</span>{" venv/bin/activate"}</div>
                                <div><span className="cmd">pip</span>{" install -r requirements.txt"}</div>
                            </CodeSection>
                            <CodeSection label={t("mac_run_label")} code={MAC_RUN}>
                                <div><span className="cmd">python3</span>{" main.py"}</div>
                            </CodeSection>
                        </div>

                        {/* CTA */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <ReqBox text={t("mac_note")} />
                            <a
                                href={GITHUB_REPO}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-ghost"
                                style={{ fontSize: "0.875rem", justifyContent: "center" }}
                            >
                                <Github size={15} />
                                Ver no GitHub
                            </a>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
