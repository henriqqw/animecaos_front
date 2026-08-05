"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const fadeUp: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: (delay: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay, ease: "easeOut" as const },
    }),
};

function MacOSWindow({
    title,
    children,
    style = {},
}: {
    title: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}) {
    return (
        <div
            style={{
                width: "100%",
                borderRadius: 16,
                overflow: "hidden",
                background: "rgba(20, 24, 30, 0.85)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow:
                    "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)",
                backdropFilter: "blur(24px) saturate(160%)",
                ...style,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1rem",
                    background: "rgba(255,255,255,0.04)",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    position: "relative",
                }}
            >
                <div style={{ display: "flex", gap: "0.4rem" }}>
                    {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                        <div
                            key={c}
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: c,
                                boxShadow: `0 0 6px ${c}55`,
                            }}
                        />
                    ))}
                </div>
                <span
                    style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "rgba(240,242,245,0.35)",
                        letterSpacing: "0.02em",
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                    }}
                >
                    {title}
                </span>
            </div>

            {children}
        </div>
    );
}

export default function Screenshots() {
    const t = useTranslations("screenshots");
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    const items = [
        {
            title: "AnimeCaos - Home",
            src: "/screenshots/home.webp",
            alt: "AnimeCaos - tela principal do app",
            width: 1599,
            height: 862,
        },
        {
            title: "AnimeCaos - Busca",
            src: "/screenshots/busca.webp",
            alt: "AnimeCaos - resultados da busca",
            width: 1599,
            height: 861,
        },
        {
            title: "AnimeCaos - Detalhes",
            src: "/screenshots/detalhes.webp",
            alt: "AnimeCaos - pagina de detalhes e episodios",
            width: 1599,
            height: 860,
        },
        {
            title: "AnimeCaos - Player",
            src: "/screenshots/player.webp",
            alt: "AnimeCaos - player integrado",
            width: 1599,
            height: 865,
        },
        {
            title: "AnimeCaos - Minha Lista",
            src: "/screenshots/lista.webp",
            alt: "AnimeCaos - watchlist de animes",
            width: 1599,
            height: 859,
        },
        {
            title: "AnimeCaos - Downloads",
            src: "/screenshots/downloads.webp",
            alt: "AnimeCaos - downloads offline",
            width: 1599,
            height: 858,
        },
        {
            title: "AnimeCaos - Conta",
            src: "/screenshots/conta.webp",
            alt: "AnimeCaos - integracao com AniList e Discord",
            width: 1599,
            height: 858,
        },
    ];

    const loopItems = [...items, ...items];

    const openLightbox = useCallback((realIndex: number) => {
        setLightboxIndex(realIndex);
    }, []);

    return (
        <section
            className="section"
            style={{ position: "relative", zIndex: 1, paddingTop: "3rem" }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    bottom: "20%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "80vw",
                    maxWidth: 900,
                    height: 400,
                    background:
                        "radial-gradient(ellipse, rgba(230,63,63,0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <div className="container">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={0}
                    style={{ textAlign: "center", marginBottom: "3.5rem" }}
                >
                    <p
                        style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--accent)",
                            marginBottom: "0.75rem",
                        }}
                    >
                        {t("label")}
                    </p>
                    <h2 className="heading-md" style={{ color: "var(--text)" }}>
                        {t("title")}
                    </h2>
                </motion.div>

                <div className="screenshots-carousel">
                    <div className="screenshots-carousel-mask">
                        <div className="screenshots-carousel-track">
                            {loopItems.map((item, index) => {
                                const realIndex = index % items.length;
                                return (
                                    <article
                                        key={`${item.src}-${index}`}
                                        className="screenshots-carousel-slide"
                                    >
                                        <button
                                            type="button"
                                            aria-label={`Ver ${item.title} em tela cheia`}
                                            onClick={() => openLightbox(realIndex)}
                                            style={{
                                                all: "unset",
                                                display: "block",
                                                width: "100%",
                                                cursor: "zoom-in",
                                                borderRadius: 16,
                                            }}
                                        >
                                            <MacOSWindow title={item.title}>
                                                <div style={{ position: "relative", width: "100%", aspectRatio: "1599/860", overflow: "hidden" }}>
                                                    <Image
                                                        src={item.src}
                                                        alt={item.alt}
                                                        fill
                                                        style={{ objectFit: "cover", objectPosition: "top", transition: "transform 0.3s ease" }}
                                                        sizes="(max-width: 768px) 88vw, 960px"
                                                        priority={index < 2}
                                                        className="screenshot-img"
                                                    />
                                                </div>
                                            </MacOSWindow>
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <Lightbox
                open={lightboxIndex >= 0}
                index={lightboxIndex}
                close={() => setLightboxIndex(-1)}
                slides={items.map((item) => ({
                    src: item.src,
                    alt: item.alt,
                    width: item.width,
                    height: item.height,
                }))}
                plugins={[Zoom, Thumbnails]}
                zoom={{
                    maxZoomPixelRatio: 4,
                    zoomInMultiplier: 2,
                    doubleTapDelay: 300,
                    doubleClickDelay: 300,
                    scrollToZoom: true,
                }}
                thumbnails={{
                    position: "bottom",
                    width: 100,
                    height: 60,
                    gap: 8,
                    border: 2,
                    borderRadius: 6,
                    padding: 2,
                }}
                styles={{
                    container: { backgroundColor: "rgba(0, 0, 0, 0.93)" },
                }}
                animation={{ fade: 200, swipe: 300 }}
                carousel={{ finite: false }}
                on={{
                    view: ({ index }) => setLightboxIndex(index),
                }}
            />
        </section>
    );
}
