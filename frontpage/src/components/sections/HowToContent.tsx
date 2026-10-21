"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRelease } from "@/lib/release/context";

const stepSequence = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.08 },
    },
};

const stepReveal = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.38, ease: "easeOut" as const },
    },
};

export default function HowToContent() {
    const t = useTranslations("howto");
    const release = useRelease();
    const steps = t.raw("steps") as Array<{ num: string; title: string; desc: string }>;

    return (
        <main className="howto-page">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="howto-page-header"
                >
                    <span className="about-kicker"><span /> QUICK START</span>
                    <h1 className="heading-lg">{t("title")}</h1>
                    <p>{t("sub")}</p>
                </motion.div>

                {/* Steps */}
                <motion.div
                    className="howto-steps"
                    variants={stepSequence}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                >
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            variants={stepReveal}
                            className="howto-step-card"
                        >
                            {/* Number */}
                            <div
                                className={`howto-step-number${i === 0 ? " is-current" : ""}`}
                            >
                                {step.num}
                            </div>

                            <div className="howto-step-copy">
                                <h3>
                                    {step.title}
                                </h3>
                                <p>
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="howto-cta"
                >
                    <a
                        href={release.windows_url ?? ""}
                        id="howto-download-btn"
                        data-analytics-channel="howto_cta"
                        data-umami-event="download_click"
                        data-umami-event-channel="howto"
                        className="btn btn-primary howto-download-button"
                    >
                        <Download size={18} />
                        Baixar AnimeCaos
                    </a>
                </motion.div>
            </div>
        </main>
    );
}
