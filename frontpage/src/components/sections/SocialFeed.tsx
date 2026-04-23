"use client";

import Script from "next/script";
import { Instagram, Twitter, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const TWITTER_POSTS: string[] = [
    "https://x.com/getanimecaos/status/2045256971670970830",
    "https://x.com/getanimecaos/status/2046959792153932043",
    "https://x.com/getanimecaos/status/2033693067526525116",
    "https://x.com/getanimecaos/status/2033694315550040305",
    "https://x.com/getanimecaos/status/2033691655862165784",
];

const INSTAGRAM_POSTS: string[] = [
    "https://www.instagram.com/p/DWB6SXBjVMQ/",
    "https://www.instagram.com/p/DXPR1S7gG80/",
];

const TWITTER_TWEET_IDS: string[] = TWITTER_POSTS
    .map((url) => url.match(/status\/(\d+)/)?.[1] ?? "")
    .filter(Boolean);

const TWITTER_HANDLE = "getanimecaos";
const INSTAGRAM_HANDLE = "getanimecaos";
const CARD_H = 610;
// Instagram oEmbed accepts maxwidth between 320 and 658. Using the minimum keeps the full post visible in a fixed-height card.
const INSTAGRAM_EMBED_W = 320;

const BTN: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "var(--text-muted)",
    cursor: "pointer",
    transition: "all 0.2s",
};

const applyNavBtnHover = (button: HTMLButtonElement) => {
    button.style.background = "var(--accent)";
    button.style.borderColor = "var(--accent)";
    button.style.color = "#fff";
    button.style.transform = "translateY(-1px) scale(1.03)";
    button.style.boxShadow = "0 8px 18px rgba(255,34,34,0.28)";
};

const resetNavBtnHover = (button: HTMLButtonElement) => {
    button.style.background = "rgba(255,255,255,0.05)";
    button.style.borderColor = "rgba(255,255,255,0.12)";
    button.style.color = "var(--text-muted)";
    button.style.transform = "translateY(0) scale(1)";
    button.style.boxShadow = "none";
};

const SOCIAL_ICON_LINK: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    borderRadius: "50%",
    color: "var(--text-muted)",
    textDecoration: "none",
    transition: "color 0.2s ease, background-color 0.2s ease, transform 0.2s ease",
};

const SOCIAL_TEXT_LINK: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--text-muted)",
    letterSpacing: "0.05em",
    textDecoration: "none",
    transition: "color 0.2s ease, opacity 0.2s ease",
};

const VIEWPORT: React.CSSProperties = {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(180deg, rgba(12,18,28,0.66) 0%, rgba(10,14,22,0.38) 100%)",
};

export default function SocialFeed() {
    const t = useTranslations("social");
    const twitterSlidesRef = useRef<(HTMLDivElement | null)[]>([]);
    const instagramSlidesRef = useRef<(HTMLDivElement | null)[]>([]);

    const [twIdx, setTwIdx] = useState(0);
    const [igIdx, setIgIdx] = useState(0);

    const twitterTotal = TWITTER_TWEET_IDS.length;
    const instagramTotal = INSTAGRAM_POSTS.length;

    const fitTweetIntoSquare = (slot: HTMLDivElement, tweetElement: HTMLElement, retry = 0) => {
        const slotRect = slot.getBoundingClientRect();
        const tweetWidth = tweetElement.offsetWidth;
        const tweetHeight = tweetElement.offsetHeight;

        if (!slotRect.width || !slotRect.height || !tweetWidth || !tweetHeight) {
            if (retry < 8) {
                window.setTimeout(() => fitTweetIntoSquare(slot, tweetElement, retry + 1), 120);
            }
            return;
        }

        const scale = Math.min(
            1,
            slotRect.width / tweetWidth,
            slotRect.height / tweetHeight,
        );

        tweetElement.style.transformOrigin = "center center";
        tweetElement.style.transform = `scale(${scale})`;
    };

    const renderTwitterTweet = async (index: number, retry = 0) => {
        const twttr = (window as any).twttr;
        const tweetId = TWITTER_TWEET_IDS[index];
        const slot = twitterSlidesRef.current[index];

        if (!tweetId || !slot || !twttr?.widgets?.createTweet || slot.dataset.rendered === "1") return;

        try {
            const containerWidth = slot.parentElement?.clientWidth ?? slot.clientWidth;
            slot.innerHTML = "";
            const tweetElement = await twttr.widgets.createTweet(tweetId, slot, {
                align: "center",
                theme: "dark",
                dnt: true,
                conversation: "none",
                width: Math.max(250, Math.floor(containerWidth)),
                cards: "hidden",
            });
            if (tweetElement) {
                tweetElement.style.width = "100%";
                tweetElement.style.maxWidth = "100%";
                fitTweetIntoSquare(slot, tweetElement);
                window.setTimeout(() => fitTweetIntoSquare(slot, tweetElement), 200);
                window.setTimeout(() => fitTweetIntoSquare(slot, tweetElement), 700);
            }
            slot.dataset.rendered = "1";
        } catch {
            if (retry < 3) {
                window.setTimeout(() => {
                    renderTwitterTweet(index, retry + 1);
                }, 900);
            }
        }
    };

    useEffect(() => {
        let tries = 0;
        const maxTries = 8;

        const timer = window.setInterval(() => {
            tries += 1;
            renderTwitterTweet(twIdx);

            const rendered = !!twitterSlidesRef.current[twIdx]?.dataset.rendered;
            if (rendered || tries >= maxTries) {
                window.clearInterval(timer);
            }
        }, 1000);

        renderTwitterTweet(twIdx);

        return () => window.clearInterval(timer);
    }, [twIdx]);

    useEffect(() => {
        const processInstagramEmbeds = (retry = 0) => {
            const instgrm = (window as any).instgrm;
            if (!instgrm?.Embeds?.process) {
                if (retry < 6) {
                    window.setTimeout(() => processInstagramEmbeds(retry + 1), 450);
                }
                return;
            }

            instgrm.Embeds.process();
        };

        processInstagramEmbeds();
    }, [igIdx]);

    useEffect(() => {
        const onResize = () => {
            twitterSlidesRef.current.forEach((slot) => {
                if (!slot) return;
                const tweet = slot.querySelector(".twitter-tweet") as HTMLElement | null;
                if (!tweet) return;
                fitTweetIntoSquare(slot, tweet);
            });
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const goTwitter = (i: number) => setTwIdx((i + twitterTotal) % twitterTotal);
    const goInstagram = (i: number) => setIgIdx((i + instagramTotal) % instagramTotal);

    return (
        <section style={{ padding: "5rem 0" }}>
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem" }}>
                        {t("label")}
                    </p>
                    <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "0.75rem" }}>
                        {t("title")}
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: 480, margin: "0 auto" }}>
                        {t("sub")}
                    </p>
                </div>

                <div className="social-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "1.25rem", height: CARD_H, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                                <a
                                    href={`https://x.com/${TWITTER_HANDLE}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Abrir perfil no X"
                                    style={SOCIAL_ICON_LINK}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = "var(--text)";
                                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = "var(--text-muted)";
                                        e.currentTarget.style.backgroundColor = "transparent";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <Twitter size={16} />
                                </a>
                                <a
                                    href={`https://x.com/${TWITTER_HANDLE}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Seguir perfil no X"
                                    style={SOCIAL_TEXT_LINK}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = "var(--text)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = "var(--text-muted)";
                                    }}
                                >
                                    <span>@{TWITTER_HANDLE}</span>
                                    <span style={{ color: "var(--accent)" }}>{t("follow_now")}</span>
                                </a>
                            </div>
                            {twitterTotal > 1 && (
                                <div style={{ display: "flex", gap: "0.35rem" }}>
                                    <button
                                        style={BTN}
                                        onClick={() => goTwitter(twIdx - 1)}
                                        onMouseEnter={(e) => applyNavBtnHover(e.currentTarget)}
                                        onMouseLeave={(e) => resetNavBtnHover(e.currentTarget)}
                                        aria-label="Previous tweet"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button
                                        style={BTN}
                                        onClick={() => goTwitter(twIdx + 1)}
                                        onMouseEnter={(e) => applyNavBtnHover(e.currentTarget)}
                                        onMouseLeave={(e) => resetNavBtnHover(e.currentTarget)}
                                        aria-label="Next tweet"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={VIEWPORT}>
                            {TWITTER_TWEET_IDS.map((tweetId, i) => (
                                <div
                                    key={tweetId}
                                    data-twitter-slide="true"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        overflow: "hidden",
                                        opacity: i === twIdx ? 1 : 0,
                                        pointerEvents: i === twIdx ? "auto" : "none",
                                        transition: "opacity 0.3s ease",
                                        scrollbarWidth: "none",
                                        padding: "0.5rem",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "100%",
                                            aspectRatio: "1 / 1",
                                            maxWidth: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            ref={(el) => {
                                                twitterSlidesRef.current[i] = el;
                                            }}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                overflow: "hidden",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {twitterTotal > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginTop: "0.75rem", flexShrink: 0 }}>
                                {TWITTER_TWEET_IDS.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goTwitter(i)}
                                        aria-label={`Tweet ${i + 1}`}
                                        style={{
                                            width: i === twIdx ? 18 : 6,
                                            height: 6,
                                            borderRadius: 100,
                                            background: i === twIdx ? "var(--accent)" : "rgba(255,255,255,0.18)",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: 0,
                                            transition: "all 0.25s ease",
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        <Script
                            src="https://platform.twitter.com/widgets.js"
                            strategy="afterInteractive"
                            onLoad={() => {
                                renderTwitterTweet(twIdx);
                            }}
                        />
                    </div>

                    <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "1.25rem", height: CARD_H, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                                <a
                                    href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Abrir perfil no Instagram"
                                    style={SOCIAL_ICON_LINK}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = "var(--text)";
                                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = "var(--text-muted)";
                                        e.currentTarget.style.backgroundColor = "transparent";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <Instagram size={16} />
                                </a>
                                <a
                                    href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Seguir perfil no Instagram"
                                    style={SOCIAL_TEXT_LINK}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = "var(--text)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = "var(--text-muted)";
                                    }}
                                >
                                    <span>@{INSTAGRAM_HANDLE}</span>
                                    <span style={{ color: "var(--accent)" }}>{t("follow_now")}</span>
                                </a>
                            </div>
                            {instagramTotal > 1 && (
                                <div style={{ display: "flex", gap: "0.35rem" }}>
                                    <button
                                        style={BTN}
                                        onClick={() => goInstagram(igIdx - 1)}
                                        onMouseEnter={(e) => applyNavBtnHover(e.currentTarget)}
                                        onMouseLeave={(e) => resetNavBtnHover(e.currentTarget)}
                                        aria-label="Previous"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button
                                        style={BTN}
                                        onClick={() => goInstagram(igIdx + 1)}
                                        onMouseEnter={(e) => applyNavBtnHover(e.currentTarget)}
                                        onMouseLeave={(e) => resetNavBtnHover(e.currentTarget)}
                                        aria-label="Next"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={VIEWPORT}>
                            {INSTAGRAM_POSTS.map((url, i) => (
                                <div
                                    key={url}
                                    data-instagram-slide="true"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        overflow: "hidden",
                                        opacity: i === igIdx ? 1 : 0,
                                        pointerEvents: i === igIdx ? "auto" : "none",
                                        transition: "opacity 0.3s ease",
                                        padding: "0.5rem",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <div
                                        ref={(el) => {
                                            instagramSlidesRef.current[i] = el;
                                        }}
                                        style={{
                                            minHeight: "100%",
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <blockquote
                                            className="instagram-media"
                                            data-instgrm-permalink={url}
                                            data-instgrm-version="14"
                                            style={{ margin: 0, width: "100%", maxWidth: INSTAGRAM_EMBED_W }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {instagramTotal > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginTop: "0.75rem", flexShrink: 0 }}>
                                {INSTAGRAM_POSTS.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goInstagram(i)}
                                        aria-label={`Slide ${i + 1}`}
                                        style={{
                                            width: i === igIdx ? 18 : 6,
                                            height: 6,
                                            borderRadius: 100,
                                            background: i === igIdx ? "var(--accent)" : "rgba(255,255,255,0.18)",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: 0,
                                            transition: "all 0.25s ease",
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        <Script
                            src="https://www.instagram.com/embed.js"
                            strategy="afterInteractive"
                            onLoad={() => {
                                (window as any).instgrm?.Embeds.process();
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
