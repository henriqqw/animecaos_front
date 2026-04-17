"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Github, Terminal, Monitor, Package, Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";

const WINDOWS_URL = "https://github.com/henriqqw/AnimeCaos/releases/download/v0.1.3/Setup_AnimeCaos_v0.1.3.exe";

const LINUX_BUILD = `git clone https://github.com/henriqqw/AnimeCaos.git
cd AnimeCaos
chmod +x build-flatpak.sh
./build-flatpak.sh`;

const LINUX_RUN = `flatpak run com.animecaos.App`;

const SOURCE_COMMANDS = `# Clone e instale
git clone https://github.com/henriqqw/animecaos.git
cd animecaos
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
python main.py`;

const CHANGELOG = [
    "Painel de Controle com integração AniList (capas + sinopses PT-BR)",
    "Download nativo via yt-dlp com progresso em tempo real",
    "Auto-Play: avança automaticamente para o próximo episódio",
    "Interface Glassmorphism com PySide6",
];

function FirefoxGlyph({ size = 14 }: { size?: number }) {
    return (
        <svg
            aria-hidden="true"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            style={{ display: "block", flexShrink: 0 }}
        >
            <circle cx="12" cy="12" r="8.8" stroke="currentColor" strokeWidth="1.7" />
            <path
                d="M17.5 6.6c-1.3-1.1-3.1-1.8-5-1.8-4.1 0-7.5 3.3-7.5 7.4 0 1.5.4 2.8 1.1 4 .4-2.2 2.3-4 4.8-4.3 1.7-.2 3.2.3 4.3 1.2-.7-.1-1.3 0-1.9.2-1.5.4-2.5 1.9-2.2 3.5.2 1.1 1 2.1 2.2 2.7 3.4-.3 6.1-3.1 6.1-6.6 0-1.5-.5-2.9-1.2-4.1-.2-.3-.4-.6-.7-.8z"
                fill="currentColor"
                opacity="0.85"
            />
            <path
                d="M16.4 5.4c1 .2 1.9.8 2.6 1.7.4.5.6 1 .8 1.6-.9-.7-2.2-1.1-3.6-.9.3-.5.4-1 .2-1.5z"
                fill="currentColor"
            />
        </svg>
    );
}

function LinuxGlyph({ size = 14 }: { size?: number }) {
    return (
        <svg
            aria-hidden="true"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            style={{ display: "block", flexShrink: 0 }}
        >
            <path
                d="M12 2C9.5 2 8 4 8 6.5c0 1.5.4 2.8 1 3.8-.8.5-1.5 1.3-1.8 2.2C6.4 13.8 6 15 6 16c0 1.5.5 2.8 1.5 3.8.5.5 1 .8 1.5 1H15c.5-.2 1-.5 1.5-1C17.5 18.8 18 17.5 18 16c0-1-.4-2.2-1.2-3.5-.3-.9-1-1.7-1.8-2.2.6-1 1-2.3 1-3.8C16 4 14.5 2 12 2z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />
            <circle cx="10" cy="8" r="1" fill="currentColor" />
            <circle cx="14" cy="8" r="1" fill="currentColor" />
            <path d="M10 13c-.8.3-1.5.8-2 1.5M14 13c.8.3 1.5.8 2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M9 19.5c-.5.3-1.2.5-2 .5M15 19.5c.5.3 1.2.5 2 .5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

export default function DownloadContent() {
    const t = useTranslations("download");
    const reqItems = t.raw("req_items") as string[];
    const reqItemsLinux = t.raw("req_items_linux") as string[];
    const [copiedSource, setCopiedSource] = useState(false);
    const [copiedLinuxBuild, setCopiedLinuxBuild] = useState(false);
    const [copiedLinuxRun, setCopiedLinuxRun] = useState(false);

    const makeCopyHandler = (text: string, setter: (v: boolean) => void) => async () => {
        try {
            await navigator.clipboard.writeText(text);
            setter(true);
            window.setTimeout(() => setter(false), 1800);
        } catch {
            setter(false);
        }
    };

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
                        {t("version")}
                    </div>
                    <h1 className="heading-lg">{t("title")}</h1>
                </motion.div>

                {/* Platform cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    {/* Windows card */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="liquid-glass"
                        style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
                    >
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                                <div className="feature-icon" style={{ width: 28, height: 28, margin: 0, flexShrink: 0 }}>
                                    <Monitor size={13} />
                                </div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Windows
                                </span>
                            </div>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                                AnimeCaos.exe
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t("sub")}</p>
                        </div>

                        <a
                            href={WINDOWS_URL}
                            id="download-exe-btn"
                            data-analytics-channel="download_page_main"
                            className="btn btn-primary"
                            style={{ fontSize: "1rem", padding: "0.9rem 1.5rem", justifyContent: "center" }}
                        >
                            <Download size={18} />
                            {t("btn")}
                        </a>

                        <div
                            style={{
                                fontSize: "0.85rem",
                                color: "var(--text)",
                                background: "rgba(230, 63, 63, 0.15)",
                                border: "1px solid rgba(230, 63, 63, 0.3)",
                                padding: "0.85rem 1.25rem",
                                borderRadius: "var(--radius)",
                                fontWeight: 500,
                                textAlign: "center"
                            }}
                        >
                            {t("note")}
                        </div>

                        {/* Changelog */}
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
                                v0.1.3 changelog
                            </p>
                            <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", listStyle: "none" }}>
                                {CHANGELOG.map((item, i) => (
                                    <li key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                        <span style={{ color: "var(--accent)", flexShrink: 0, display: "inline-flex", alignItems: "center" }}>
                                            <Check size={14} />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Linux card */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="liquid-glass"
                        style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
                    >
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                                <div className="feature-icon" style={{ width: 28, height: 28, margin: 0, flexShrink: 0 }}>
                                    <LinuxGlyph size={13} />
                                </div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Linux
                                </span>
                            </div>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                                {t("linux_title")}
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t("linux_sub")}</p>
                        </div>

                        {/* Build commands */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", marginBottom: "0.75rem" }}>
                                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    {t("linux_build_label")}
                                </p>
                                <button
                                    type="button"
                                    onClick={makeCopyHandler(LINUX_BUILD, setCopiedLinuxBuild)}
                                    className="btn btn-ghost"
                                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.7rem" }}
                                >
                                    {copiedLinuxBuild ? <Check size={13} /> : <Copy size={13} />}
                                    {copiedLinuxBuild ? "Copiado!" : "Copiar"}
                                </button>
                            </div>
                            <div className="code-block">
                                <div><span className="cmd">git</span> clone https://github.com/henriqqw/AnimeCaos.git</div>
                                <div><span className="cmd">cd</span> AnimeCaos</div>
                                <div><span className="cmd">chmod</span> +x build-flatpak.sh</div>
                                <div><span className="cmd">./build-flatpak.sh</span></div>
                            </div>
                        </div>

                        {/* Run command */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", marginBottom: "0.75rem" }}>
                                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    {t("linux_run_label")}
                                </p>
                                <button
                                    type="button"
                                    onClick={makeCopyHandler(LINUX_RUN, setCopiedLinuxRun)}
                                    className="btn btn-ghost"
                                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.7rem" }}
                                >
                                    {copiedLinuxRun ? <Check size={13} /> : <Copy size={13} />}
                                    {copiedLinuxRun ? "Copiado!" : "Copiar"}
                                </button>
                            </div>
                            <div className="code-block">
                                <div><span className="cmd">flatpak</span> run com.animecaos.App</div>
                            </div>
                        </div>

                        <div
                            style={{
                                fontSize: "0.85rem",
                                color: "var(--text)",
                                background: "rgba(59, 130, 246, 0.12)",
                                border: "1px solid rgba(59, 130, 246, 0.28)",
                                padding: "0.85rem 1.25rem",
                                borderRadius: "var(--radius)",
                                fontWeight: 500,
                                textAlign: "center"
                            }}
                        >
                            {t("linux_note")}
                        </div>

                        <a
                            href="https://github.com/henriqqw/AnimeCaos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost"
                            style={{ fontSize: "0.875rem", justifyContent: "center" }}
                        >
                            <Github size={15} />
                            Ver no GitHub
                        </a>
                    </motion.div>
                </div>

                {/* Info cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {/* Requirements */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="glass"
                        style={{ padding: "1.75rem", borderRadius: "var(--radius-lg)" }}
                    >
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>{t("requirements")}</h3>

                        {/* Windows reqs */}
                        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                            Windows
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1.25rem" }}>
                            {reqItems.map((req, i) => {
                                const Icon = i === 0 ? Monitor : i === 2 ? Terminal : Package;
                                return (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <div className="feature-icon" style={{ width: 32, height: 32, margin: 0, flexShrink: 0 }}>
                                            {i === 1 ? <FirefoxGlyph size={14} /> : <Icon size={14} />}
                                        </div>
                                        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{req}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Linux reqs */}
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                                Linux
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                                {reqItemsLinux.map((req, i) => {
                                    const Icon = i === 0 ? Monitor : i === 1 ? Package : Terminal;
                                    return (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <div className="feature-icon" style={{ width: 32, height: 32, margin: 0, flexShrink: 0 }}>
                                                {i === 0 ? <LinuxGlyph size={14} /> : <Icon size={14} />}
                                            </div>
                                            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{req}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Source install */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="glass"
                        style={{ padding: "1.75rem", borderRadius: "var(--radius-lg)" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{t("source_title")}</h3>
                            <button
                                type="button"
                                onClick={makeCopyHandler(SOURCE_COMMANDS, setCopiedSource)}
                                className="btn btn-ghost"
                                style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem" }}
                            >
                                {copiedSource ? <Check size={14} /> : <Copy size={14} />}
                                {copiedSource ? "Copiado!" : "Copiar comandos"}
                            </button>
                        </div>
                        <div className="code-block">
                            <div><span className="comment"># Clone e instale</span></div>
                            <div><span className="cmd">git</span> clone https://github.com/henriqqw/animecaos.git</div>
                            <div><span className="cmd">cd</span> animecaos</div>
                            <div><span className="cmd">python</span> -m venv venv</div>
                            <div><span className="cmd">venv\Scripts\activate</span></div>
                            <div><span className="cmd">pip</span> install -r requirements.txt</div>
                            <div><span className="cmd">python</span> main.py</div>
                        </div>
                        <a
                            href="https://github.com/henriqqw/animecaos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost"
                            style={{ marginTop: "1rem", fontSize: "0.875rem" }}
                        >
                            <Github size={15} />
                            Ver no GitHub
                        </a>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
