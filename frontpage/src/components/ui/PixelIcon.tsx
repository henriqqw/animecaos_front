import type { CSSProperties } from "react";

export type PixelIconName =
    | "alert"
    | "check"
    | "database"
    | "download"
    | "package"
    | "pause"
    | "search"
    | "skip-back"
    | "skip-forward"
    | "tv"
    | "user"
    | "zap";

const GLYPHS: Record<PixelIconName, readonly string[]> = {
    alert: [
        "...##...",
        "...##...",
        "..#..#..",
        "..#..#..",
        ".######.",
        ".##..##.",
        "...##...",
        "...##...",
    ],
    check: [
        "........",
        ".......#",
        "......##",
        "#....##.",
        ".#..##..",
        "..###...",
        "...#....",
        "........",
    ],
    database: [
        "..####..",
        ".#....#.",
        "#......#",
        "########",
        "#......#",
        "#......#",
        ".#....#.",
        "..####..",
    ],
    download: [
        "...##...",
        "...##...",
        "...##...",
        ".######.",
        "..####..",
        "...##...",
        "........",
        "########",
    ],
    package: [
        "..####..",
        ".#....#.",
        "#..##..#",
        "#..##..#",
        "#......#",
        "#..##..#",
        ".######.",
        "........",
    ],
    pause: [
        ".##..##.",
        ".##..##.",
        ".##..##.",
        ".##..##.",
        ".##..##.",
        ".##..##.",
        "........",
        "........",
    ],
    search: [
        "..####..",
        ".#....#.",
        "#......#",
        "#......#",
        "#......#",
        ".#....#.",
        "..####..",
        ".....###",
    ],
    "skip-back": [
        "##....##",
        "##...###",
        "##..####",
        "##.#####",
        "##..####",
        "##...###",
        "##....##",
        "........",
    ],
    "skip-forward": [
        "##....##",
        "###...##",
        "####..##",
        "#####.##",
        "####..##",
        "###...##",
        "##....##",
        "........",
    ],
    tv: [
        "..#..#..",
        "...##...",
        ".######.",
        "#......#",
        "#......#",
        "#......#",
        ".######.",
        "...##...",
    ],
    user: [
        "......####......",
        ".....######.....",
        "....########....",
        "....########....",
        "....########....",
        ".....######.....",
        "......####......",
        "................",
        ".......##.......",
        "......####......",
        "....########....",
        "...##########...",
        "..############..",
        "..############..",
        ".##############.",
        ".##############.",
    ],
    zap: [
        "...##...",
        "...##...",
        "..###...",
        ".######.",
        "....##..",
        "...##...",
        "..##....",
        ".##.....",
    ],
};

interface PixelIconProps {
    name: PixelIconName;
    size?: number;
    color?: string;
    style?: CSSProperties;
    className?: string;
}

export default function PixelIcon({ name, size = 16, color = "currentColor", style, className }: PixelIconProps) {
    const glyph = GLYPHS[name];
    const cellSize = 16 / glyph.length;

    return (
        <svg
            aria-hidden="true"
            className={className}
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill={color}
            shapeRendering="crispEdges"
            style={{ flexShrink: 0, ...style }}
        >
            {glyph.flatMap((row, y) =>
                [...row].map((pixel, x) =>
                    pixel === "#" ? <rect key={`${x}-${y}`} x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} /> : null,
                ),
            )}
        </svg>
    );
}
