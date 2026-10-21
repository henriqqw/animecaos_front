"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Mail, MessageCircle, Instagram, Linkedin, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

const SOCIALS = [
    {
        icon: Github,
        label: "GitHub",
        handle: "@henriqqw",
        href: "https://github.com/henriqqw",
        desc: "Código & Projetos",
    },
    {
        icon: Twitter,
        label: "Twitter / X",
        handle: "@getanimecaos",
        href: "https://x.com/getanimecaos",
        desc: "Updates & posts",
    },
    {
        icon: MessageCircle,
        label: "Discord",
        handle: "chaosphory",
        href: "https://discord.com/users/chaosphory",
        desc: "Chat direto",
    },
    {
        icon: Instagram,
        label: "Instagram",
        handle: "@getanimecaos",
        href: "https://www.instagram.com/getanimecaos/",
        desc: "Conteúdo & updates",
    },
    {
        icon: Linkedin,
        label: "LinkedIn",
        handle: "henrique-lanzoni",
        href: "https://www.linkedin.com/in/henrique-lanzoni-ab0828371/",
        desc: "Profissional",
    },
    {
        icon: Mail,
        label: "Email",
        handle: "lanzonicmpny13@gmail.com",
        href: "mailto:lanzonicmpny13@gmail.com",
        desc: "Direto na caixa",
    },
];

export default function ContactContent() {
    const t = useTranslations("contact");

    return (
        <main className="contact-page">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="contact-page-header"
                >
                    <span className="about-kicker"><span /> GET IN TOUCH</span>
                    <h1 className="heading-lg">{t("title")}</h1>
                    <p>{t("sub")}</p>
                </motion.div>

                {/* GitHub CTA */}
                <motion.a
                    href="https://github.com/henriqqw/animecaos/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    id="github-issue-btn"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="contact-issue-card"
                >
                    <div className="contact-issue-main">
                        <div className="contact-issue-icon">
                            <Github size={20} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>{t("issue")}</p>
                            <p style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>
                                github.com/henriqqw/animecaos/issues
                            </p>
                        </div>
                    </div>
                    <ExternalLink size={18} style={{ color: "var(--text-muted)" }} />
                </motion.a>

                {/* Social grid */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="contact-links-heading"
                >
                    {t("links_title")}
                </motion.p>

                <div className="contact-social-grid">
                    {SOCIALS.map(({ icon: Icon, label, handle, href, desc }, i) => (
                        <motion.a
                            key={i}
                            href={href}
                            target={href.startsWith("mailto") ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 }}
                            className="contact-social-card"
                        >
                            <div className="contact-social-icon">
                                <Icon size={18} />
                            </div>
                            <div className="contact-social-copy">
                                <p className="contact-social-label">{label}</p>
                                <p className="contact-social-handle">
                                    {handle}
                                </p>
                            </div>
                            <p className="contact-social-desc">
                                {desc}
                            </p>
                        </motion.a>
                    ))}
                </div>
            </div>
        </main>
    );
}
