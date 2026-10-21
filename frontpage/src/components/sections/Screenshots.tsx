"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import PixelWindow from "@/components/ui/PixelWindow";
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

export default function Screenshots() {
    const t = useTranslations("screenshots");
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    const items = [
        {
            title: "AnimeCaos - Início",
            src: "/screenshots/Home.png",
            alt: "AnimeCaos - tela inicial com destaques e animes em andamento",
            width: 1599,
            height: 858,
        },
        {
            title: "AnimeCaos - Resultados da busca",
            src: "/screenshots/search_results.png",
            alt: "AnimeCaos - resultados encontrados para uma busca de anime",
            width: 1599,
            height: 856,
        },
        {
            title: "AnimeCaos - Busca em andamento",
            src: "/screenshots/search_skeleton.png",
            alt: "AnimeCaos - busca de animes carregando com esqueletos de conteúdo",
            width: 1599,
            height: 860,
        },
        {
            title: "AnimeCaos - Nenhum resultado",
            src: "/screenshots/no_results.png",
            alt: "AnimeCaos - estado de busca sem resultados",
            width: 1599,
            height: 856,
        },
        {
            title: "AnimeCaos - Página do anime",
            src: "/screenshots/anime_page.png",
            alt: "AnimeCaos - detalhes do anime Hunter x Hunter e lista de episódios",
            width: 1599,
            height: 864,
        },
        {
            title: "AnimeCaos - Histórico",
            src: "/screenshots/historico.png",
            alt: "AnimeCaos - histórico de animes assistidos recentemente",
            width: 1599,
            height: 865,
        },
        {
            title: "AnimeCaos - Minha lista",
            src: "/screenshots/my_list.png",
            alt: "AnimeCaos - lista pessoal de animes",
            width: 1599,
            height: 862,
        },
        {
            title: "AnimeCaos - Downloads",
            src: "/screenshots/downloads.png",
            alt: "AnimeCaos - downloads offline",
            width: 1599,
            height: 860,
        },
        {
            title: "AnimeCaos - Mangás",
            src: "/screenshots/mangas.png",
            alt: "AnimeCaos - descoberta e categorias de mangás",
            width: 1599,
            height: 862,
        },
        {
            title: "AnimeCaos - Biblioteca de mangás",
            src: "/screenshots/mangas_01.png",
            alt: "AnimeCaos - biblioteca de mangás com leituras em andamento",
            width: 1599,
            height: 868,
        },
        {
            title: "AnimeCaos - Tela de abertura",
            src: "/screenshots/splash.png",
            alt: "AnimeCaos - tela de abertura do aplicativo",
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
                                                borderRadius: 0,
                                            }}
                                        >
                                            <PixelWindow title={item.title}>
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
                                            </PixelWindow>
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
