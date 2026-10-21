import type { ReactNode } from "react";

interface PixelWindowProps {
    title: string;
    children: ReactNode;
    minimized?: boolean;
    onMinimize?: () => void;
    onClose?: () => void;
}

function WindowControl({
    label,
    glyph,
    onClick,
}: {
    label: string;
    glyph: string;
    onClick?: () => void;
}) {
    if (!onClick) {
        return <span aria-hidden="true">{glyph}</span>;
    }

    return (
        <button type="button" aria-label={label} onClick={onClick}>
            {glyph}
        </button>
    );
}

export default function PixelWindow({
    title,
    children,
    minimized = false,
    onMinimize,
    onClose,
}: PixelWindowProps) {
    return (
        <div className="pixel-window">
            <div className="pixel-window__titlebar">
                <div className="pixel-window__caption">
                    <span className="pixel-window__app-icon" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <i />
                    </span>
                    <span>{title}</span>
                </div>

                <div className="pixel-window__controls">
                    <WindowControl label="Minimizar janela" glyph="_" onClick={onMinimize} />
                    <span aria-hidden="true">□</span>
                    <WindowControl label="Fechar janela" glyph="x" onClick={onClose} />
                </div>
            </div>

            {minimized ? <div className="pixel-window__minimized-body" /> : children}
        </div>
    );
}
