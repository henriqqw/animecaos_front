"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { Download, Github, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRelease } from "@/lib/release/context";

const GITHUB_URL = "https://github.com/henriqqw/animecaos";
const HEARTS = ["❤️", "🩷", "💕", "✨", "💖"];

function ChibiPet() {
    const [petting, setPetting] = useState(false);
    const [hearts, setHearts] = useState<{ id: number; x: number; emoji: string }[]>([]);
    const petIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartIdRef = useRef(0);

    const spawnHeart = useCallback(() => {
        const x = 20 + Math.random() * 60;
        const emoji = HEARTS[Math.floor(Math.random() * HEARTS.length)];
        const id = heartIdRef.current++;
        setHearts((prev) => [...prev, { id, x, emoji }]);
        setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 1100);
    }, []);

    const stopPetting = useCallback(() => {
        setPetting(false);
        if (petIntervalRef.current) {
            clearInterval(petIntervalRef.current);
            petIntervalRef.current = null;
        }
    }, []);

    const handleClick = useCallback(() => {
        spawnHeart();
        setPetting(true);
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        stopTimerRef.current = setTimeout(stopPetting, 600);
    }, [spawnHeart, stopPetting]);

    useEffect(() => () => { stopPetting(); }, [stopPetting]);

    return (
        <div
            className={`chibi-wrapper cta-character${petting ? " petting" : ""}`}
            onClick={handleClick}
            aria-hidden="true"
        >
            {hearts.map((h) => (
                <span
                    key={h.id}
                    className="chibi-heart"
                    style={{ left: `${h.x}%`, bottom: "80%" }}
                >
                    {h.emoji}
                </span>
            ))}

            <Image
                src="/frieren_footer.webp"
                alt=""
                width={260}
                height={380}
                className="chibi-img"
                draggable={false}
            />
        </div>
    );
}

export default function DownloadCTA() {
    const t = useTranslations("download");
    const release = useRelease();
    const locale = useLocale();

    return (
        <section className="section" id="download-cta">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    className="liquid-glass"
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        padding: "clamp(2rem, 5vw, 4rem)",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1.5rem",
                    }}
                >
                    <div className="badge">
                        <Download size={11} />
                        {t("version")} {release.tag}
                    </div>

                    <h2 className="heading-lg" style={{ maxWidth: 560 }}>
                        {t("title")}
                    </h2>

                    <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: 460 }}>
                        {t("cta_sub")}
                    </p>

                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
                        <a
                            href={`/${locale}/download`}
                            id="cta-download-btn"
                            data-umami-event="home_cta_downloads"
                            className="btn btn-primary"
                            style={{ fontSize: "1.05rem", padding: "0.9rem 2rem" }}
                        >
                            <Download size={18} />
                            {t("cta_btn")}
                        </a>
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost"
                            style={{ fontSize: "1.05rem", padding: "0.9rem 2rem" }}
                        >
                            <Github size={18} />
                            GitHub
                            <ArrowRight size={16} />
                        </a>
                    </div>

                    {/* zero-size anchor so chibi doesn't affect card layout */}
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 0, height: 0, overflow: "visible" }} aria-hidden="true">
                        <ChibiPet />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
