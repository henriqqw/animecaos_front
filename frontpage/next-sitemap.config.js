/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: "https://animecaos.xyz",
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    alternateRefs: [
        { href: "https://animecaos.xyz/pt", hreflang: "pt-BR" },
        { href: "https://animecaos.xyz/en", hreflang: "en-US" },
    ],
    additionalPaths: async () => {
        const locales = ["pt", "en"];
        const paths = ["/", "/about", "/download", "/how-to-use", "/contact"];
        return locales.flatMap((locale) =>
            paths.map((path) => ({
                loc: `/${locale}${path === "/" ? "" : path}`,
                changefreq: path === "/" ? "weekly" : "monthly",
                priority: path === "/" ? 1.0 : 0.8,
                lastmod: new Date().toISOString(),
            }))
        );
    },
    robotsTxtOptions: {
        policies: [{ userAgent: "*", allow: "/" }],
        additionalSitemaps: ["https://animecaos.xyz/sitemap.xml"],
    },
};
