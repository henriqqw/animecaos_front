"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import MagicBento from "@/components/ui/MagicBento";
import PixelIcon, { type PixelIconName } from "@/components/ui/PixelIcon";

/* ── design tokens ── */
const T = {
    muted:   "rgba(255,255,255,0.22)",
    subtle:  "rgba(255,255,255,0.45)",
    mid:     "rgba(255,255,255,0.65)",
    border:  "rgba(255,255,255,0.07)",
    red:     "#e63f3f",
    green:   "#3fb950",
    redDim:  "rgba(230,63,63,0.18)",
} as const;

const bar = (color: string, w: string, delay = "0s"): React.CSSProperties => ({
    height: "100%",
    width: w,
    borderRadius: 2,
    background: color,
    transformOrigin: "left",
    animation: `bento-scale-x 1s ease both`,
    animationDelay: delay,
});

const row = (delay = 0): React.CSSProperties => ({
    animation: "bento-fade-in-up 0.45s ease both",
    animationDelay: `${delay}s`,
});

/* ─────────────────────────────────────────────
   1. HUB  — search + 3 fonte rows
───────────────────────────────────────────── */
function HubVisual() {
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {/* search line */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.55rem", borderBottom: `1px solid ${T.border}` }}>
                <PixelIcon name="search" size={12} color={T.muted} />
                <span style={{ fontSize: "0.8rem", color: T.mid, letterSpacing: "-0.01em" }}>attack on titan</span>
                <span style={{ fontSize: "0.8rem", color: T.red, animation: "bento-cursor 1s step-end infinite" }}>|</span>
            </div>

            {/* sources */}
            {[
                { name: "87 episódios",  time: "HD",  delay: 0.05 },
                { name: "Legendado PT", time: "✓",    delay: 0.18 },
                { name: "Dublado PT",   time: "✓",    delay: 0.31 },
            ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...row(s.delay) }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <PixelIcon name="check" size={11} color={T.green} />
                        <span style={{ fontSize: "0.78rem", color: T.subtle }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: T.muted, fontVariantNumeric: "tabular-nums" }}>{s.time}</span>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   2. PLAYER  — progress + controls
───────────────────────────────────────────── */
function PlayerVisual() {
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {/* progress bar */}
            <div>
                <div style={{ height: 3, background: T.border, overflow: "hidden", position: "relative" }}>
                    <div style={bar(T.red, "58%")} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
                    <span style={{ fontSize: "0.65rem", color: T.muted, fontVariantNumeric: "tabular-nums" }}>12:34</span>
                    <span style={{ fontSize: "0.65rem", color: T.muted, fontVariantNumeric: "tabular-nums" }}>24:00</span>
                </div>
            </div>

            {/* controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.4rem" }}>
                <PixelIcon name="skip-back" size={15} color={T.subtle} style={{ cursor: "pointer" }} />
                <div style={{
                    width: 32, height: 32,
                    background: T.red,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `3px 3px 0 ${T.redDim}`,
                }}>
                    <PixelIcon name="pause" size={13} color="white" />
                </div>
                <PixelIcon name="skip-forward" size={15} color={T.subtle} style={{ cursor: "pointer" }} />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   3. ANILIST  — mini profile like the app
───────────────────────────────────────────── */
function AnilistVisual() {
    const locale = useLocale();
    const stats = [
        { value: "87",   label: "Animes"    },
        { value: "1.2k", label: "Episódios" },
        { value: "340h", label: "Tempo"     },
    ];
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.1rem" }}>

            {/* profile row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {/* avatar */}
                <PixelIcon name="user" size={40} color="rgba(255,120,120,0.7)" />
                <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, color: T.mid, letterSpacing: "-0.01em", marginBottom: "0.18rem" }}>
                        usuário
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <span style={{ width: 6, height: 6, background: T.green, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.64rem", color: T.green }}>
                            {locale === "pt" ? "Trackers conectados" : "Trackers connected"}
                        </span>
                    </div>
                </div>
            </div>

            {/* stats grid */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
                {stats.map((s, i) => (
                    <div key={i} style={{
                        flex: 1, textAlign: "center",
                        padding: "0.6rem 0.4rem",
                        borderRadius: 0,
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${T.border}`,
                        ...row(i * 0.08),
                    }}>
                        <p style={{ fontSize: "1.05rem", fontWeight: 800, color: T.mid, letterSpacing: "-0.03em", lineHeight: 1 }}>
                            {s.value}
                        </p>
                        <p style={{ fontSize: "0.58rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "0.25rem" }}>
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* sync line */}
            <p style={{ fontSize: "0.65rem", color: T.muted, textAlign: "center" }}>
                Sincronizado automaticamente
            </p>
        </div>
    );
}

/* ─────────────────────────────────────────────
   4. AUTO-PLAY  — Spotify-style mini player
───────────────────────────────────────────── */
function AutoPlayVisual() {
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.1rem" }}>

            {/* track row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {/* thumbnail */}
                <div style={{
                    width: 44, height: 44, flexShrink: 0,
                    background: "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <PixelIcon name="tv" size={18} color={T.mid} />
                </div>

                {/* meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, color: T.mid, letterSpacing: "-0.015em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Episódio 05
                    </p>
                    <p style={{ fontSize: "0.7rem", color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Attack on Titan · S1
                    </p>
                </div>

                {/* up next badge */}
                <span style={{
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: T.red,
                    background: T.redDim,
                    padding: "0.2rem 0.45rem", flexShrink: 0,
                }}>
                    A seguir
                </span>
            </div>

            {/* progress */}
            <div>
                <div style={{ height: 2, borderRadius: 2, background: T.border, overflow: "hidden", marginBottom: "0.35rem" }}>
                    <div style={{ height: "100%", borderRadius: 2, background: T.red, animation: "bento-countdown 5s linear infinite" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.63rem", color: T.muted }}>Reproduzindo em</span>
                    <span style={{ fontSize: "0.63rem", fontWeight: 700, color: T.red, fontVariantNumeric: "tabular-nums" }}>5s</span>
                </div>
            </div>

            {/* controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
                <PixelIcon name="skip-back" size={16} color={T.subtle} style={{ cursor: "pointer" }} />
                <div style={{
                    width: 34, height: 34,
                    background: T.red, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `3px 3px 0 ${T.redDim}`,
                    cursor: "pointer",
                }}>
                    <PixelIcon name="pause" size={14} color="white" />
                </div>
                <PixelIcon name="skip-forward" size={16} color={T.subtle} style={{ cursor: "pointer" }} />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   5. DOWNLOAD  — flat progress
───────────────────────────────────────────── */
function DownloadVisual() {
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {/* file name */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <PixelIcon name="download" size={12} color={T.green} />
                <span style={{ fontSize: "0.76rem", color: T.mid, fontFamily: "monospace", letterSpacing: "-0.01em" }}>
                    shingeki_s4_ep28.mp4
                </span>
            </div>

            {/* bar */}
            <div style={{ height: 2, borderRadius: 2, background: T.border, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, background: T.green, animation: "bento-download 3.5s ease-in-out infinite" }} />
            </div>

            {/* stats */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.68rem", color: T.muted }}>72 MB / 90 MB</span>
                <span style={{ fontSize: "0.72rem", color: T.green, fontWeight: 700 }}>80%</span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   6. STANDALONE  — flat checklist
───────────────────────────────────────────── */
function StandaloneVisual() {
    const locale = useLocale();
    const items = locale === "pt"
        ? ["Instalador completo", "0 dependências externas", "Instala, abre e funciona"]
        : ["Complete installer", "0 external dependencies", "Install, open and watch"];
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {items.map((label, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.55rem", ...row(i * 0.1) }}>
                    <PixelIcon name="check" size={12} color={T.green} />
                    <span style={{ fontSize: "0.78rem", color: T.subtle }}>{label}</span>
                </div>
            ))}
        </div>
    );
}

/* ── wiring ── */
const ICONS: PixelIconName[] = ["tv", "zap", "database", "skip-forward", "download", "package"];
const VISUALS = [HubVisual, PlayerVisual, AnilistVisual, AutoPlayVisual, DownloadVisual, StandaloneVisual];

// render order: small cards first (hub, player, download, standalone), large last (anilist, autoplay)
const ORDER = [0, 1, 4, 5, 2, 3];

type FeatureItem = { title: string; desc: string };

export default function Features() {
    const t = useTranslations("features");
    const items = t.raw("items") as FeatureItem[];

    const bentoItems = ORDER.map((idx) => {
        const item   = items[idx];
        const iconName = ICONS[idx];
        const Visual = VISUALS[idx];
        return {
            title: item.title,
            description: item.desc,
            label: item.title.split(" ")[0].toUpperCase(),
            icon: iconName ? <PixelIcon name={iconName} size={18} /> : undefined,
            visual: Visual ? <Visual />          : undefined,
        };
    });

    return (
        <section className="section" id="features">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: "center", marginBottom: "4rem" }}
                >
                    <h2 className="heading-lg" style={{ marginBottom: "1rem" }}>
                        {t("title")}
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>{t("sub")}</p>
                </motion.div>

                <div className="features-magic-wrap">
                    <MagicBento
                        items={bentoItems}
                        textAutoHide
                        enableStars={false}
                        enableSpotlight={false}
                        enableBorderGlow={false}
                        enableTilt={false}
                        enableMagnetism
                        clickEffect
                        spotlightRadius={400}
                        particleCount={12}
                        glowColor="230, 63, 63"
                        disableAnimations={false}
                    />
                </div>
            </div>
        </section>
    );
}
