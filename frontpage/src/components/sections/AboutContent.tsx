"use client";

import { motion } from "framer-motion";
import {
    ArrowUpRight,
    BookOpen,
    Code2,
    Download,
    Github,
    MonitorPlay,
    Music2,
    PackageCheck,
    Radio,
    ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import PixelWindow from "@/components/ui/PixelWindow";

const STACK = [
    { icon: Code2, name: "Go", detailKey: "stack_go" },
    { icon: MonitorPlay, name: "Wails 2", detailKey: "stack_wails" },
    { icon: Code2, name: "React + TypeScript", detailKey: "stack_frontend" },
    { icon: Music2, name: "MPV + FFmpeg", detailKey: "stack_media" },
];

const CAPABILITIES = [
    { icon: MonitorPlay, titleKey: "anime_title", descKey: "anime_desc", index: "01" },
    { icon: BookOpen, titleKey: "manga_title", descKey: "manga_desc", index: "02" },
    { icon: Radio, titleKey: "integrations_title", descKey: "integrations_desc", index: "03" },
    { icon: PackageCheck, titleKey: "distribution_title", descKey: "distribution_desc", index: "04" },
];

export default function AboutContent() {
    const t = useTranslations("about");

    return (
        <main className="about-page">
            <div className="container about-container">
                <motion.section
                    className="about-hero"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    aria-labelledby="about-title"
                >
                    <div className="about-hero-copy">
                        <span className="about-kicker"><span /> {t("eyebrow")}</span>
                        <h1 id="about-title" className="about-title">{t("title")}</h1>
                        <p className="about-lead">{t("p1")}</p>
                        <p className="about-body">{t("p2")}</p>
                        <div className="about-hero-actions">
                            <a className="btn btn-primary" href="https://github.com/henriqqw/AnimeCaos/releases/tag/v3.0.0" target="_blank" rel="noopener noreferrer">
                                <Download size={16} /> {t("release_btn")}
                            </a>
                            <a className="btn btn-ghost" href="https://github.com/henriqqw/AnimeCaos" target="_blank" rel="noopener noreferrer">
                                <Github size={16} /> GitHub <ArrowUpRight size={14} />
                            </a>
                        </div>
                    </div>

                    <div className="about-build-window" aria-label={t("release_card_label")}>
                        <PixelWindow title={`AnimeCaos — ${t("release_card_label")}`}>
                        <div className="about-build-body">
                            <div className="about-build-meta">
                                <p className="about-build-caption">{t("runtime_label")}</p>
                                <span className="about-build-version">v3.0.0</span>
                            </div>
                            <strong>Go <span>+</span> Wails 2</strong>
                            <div className="about-build-divider" />
                            <p className="about-build-caption">{t("interface_label")}</p>
                            <strong>React <span>+</span> TypeScript</strong>
                            <div className="about-build-status"><ShieldCheck size={15} /> {t("legacy_note")}</div>
                        </div>
                        </PixelWindow>
                    </div>
                </motion.section>

                <section className="about-stack-section" aria-labelledby="about-stack-title">
                    <div className="about-section-heading">
                        <span className="about-section-index">// 01</span>
                        <h2 id="about-stack-title">{t("tech_title")}</h2>
                    </div>
                    <div className="about-stack-grid">
                        {STACK.map(({ icon: Icon, name, detailKey }, i) => (
                            <motion.article
                                className="about-stack-card"
                                key={name}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                            >
                                <span className="about-card-icon"><Icon size={19} strokeWidth={1.8} /></span>
                                <span className="about-card-copy">
                                    <strong>{name}</strong>
                                    <small>{t(detailKey as "stack_go" | "stack_wails" | "stack_frontend" | "stack_media")}</small>
                                </span>
                            </motion.article>
                        ))}
                    </div>
                </section>

                <section className="about-capabilities-section" aria-labelledby="about-capabilities-title">
                    <div className="about-section-heading">
                        <span className="about-section-index">// 02</span>
                        <h2 id="about-capabilities-title">{t("features_title")}</h2>
                    </div>
                    <div className="about-capability-grid">
                        {CAPABILITIES.map(({ icon: Icon, titleKey, descKey, index }, i) => (
                            <motion.article
                                className="about-capability-card"
                                key={titleKey}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                            >
                                <div className="about-capability-top">
                                    <span className="about-card-icon"><Icon size={19} strokeWidth={1.8} /></span>
                                    <span className="about-capability-index">{index}</span>
                                </div>
                                <h3>{t(titleKey as "anime_title" | "manga_title" | "integrations_title" | "distribution_title")}</h3>
                                <p>{t(descKey as "anime_desc" | "manga_desc" | "integrations_desc" | "distribution_desc")}</p>
                            </motion.article>
                        ))}
                    </div>
                </section>

                <motion.section
                    className="about-open-source"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35 }}
                >
                    <div className="about-open-icon"><Github size={22} /></div>
                    <div className="about-open-copy">
                        <span className="about-section-index">// 03 · OPEN SOURCE</span>
                        <h2>{t("open_title")}</h2>
                        <p>{t("open_desc")}</p>
                    </div>
                    <a className="about-open-link" href="https://github.com/henriqqw/AnimeCaos" target="_blank" rel="noopener noreferrer" aria-label={t("repo_link_label")}>
                        <ArrowUpRight size={19} />
                    </a>
                </motion.section>
            </div>
        </main>
    );
}
