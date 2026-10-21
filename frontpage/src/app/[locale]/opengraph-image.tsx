import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AnimeCaos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isPt = locale !== "en";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #12121e 55%, #0d0d1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          gap: "0px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://animecaos.xyz/wordmark.png"
          width={360}
          height={180}
          style={{ marginBottom: "34px" }}
          alt=""
        />
        <div
          style={{
            fontSize: "30px",
            color: "#8888aa",
            textAlign: "center",
            maxWidth: "820px",
            lineHeight: "1.4",
          }}
        >
          {isPt
            ? "Assistir animes grátis, sem anúncios"
            : "Watch anime for free, without ads"}
        </div>
      </div>
    ),
    { ...size }
  );
}
