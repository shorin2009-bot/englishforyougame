import React from "react";
import { Easing, Img, interpolate, random, spring, staticFile } from "remotion";
import { FPS } from "./timeline";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);

/** nội suy có kẹp hai đầu */
export const lerp = (t: number, a: number, b: number, from: number, to: number, ease = easeInOut) =>
  interpolate(t, [a, b], [from, to], { ...clamp, easing: ease });

/** lò xo bắt đầu tại giây `at` */
export const pop = (frame: number, at: number, damping = 11, stiffness = 170, mass = 0.8) =>
  spring({ frame: frame - Math.round(at * FPS), fps: FPS, config: { damping, stiffness, mass } });

/** độ hiện: vào tại a, ra tại b */
export const life = (t: number, a: number, b: number, fadeIn = 0.15, fadeOut = 0.2) =>
  Math.min(lerp(t, a, a + fadeIn, 0, 1), lerp(t, b - fadeOut, b, 1, 0));

export const Emoji: React.FC<{ name: string; size: number; style?: React.CSSProperties }> = ({
  name,
  size,
  style,
}) => (
  <Img
    src={staticFile(`emoji/${name}.webp`)}
    style={{ width: size, height: size, display: "block", ...style }}
  />
);

/** Chữ có viền: lớp viền nằm dưới, lớp chữ nằm trên (không phụ thuộc paint-order) */
export const Outline: React.FC<{
  children: React.ReactNode;
  stroke: string;
  width: number;
  color: string;
  style?: React.CSSProperties;
  shadow?: string;
}> = ({ children, stroke, width, color, style, shadow }) => (
  <span style={{ position: "relative", display: "inline-block", ...style }}>
    <span
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        WebkitTextStroke: `${width * 2}px ${stroke}`,
        color: stroke,
        textShadow: shadow,
        whiteSpace: "inherit",
      }}
    >
      {children}
    </span>
    <span style={{ position: "relative", color, whiteSpace: "inherit" }}>{children}</span>
  </span>
);

export const Blossom: React.FC<{ size: number; petal: string; center: string }> = ({
  size,
  petal,
  center,
}) => (
  <svg viewBox="-50 -50 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={i} cx={0} cy={-25} rx={18} ry={25} fill={petal} transform={`rotate(${i * 72})`} />
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <line
        key={`l${i}`}
        x1={0}
        y1={0}
        x2={0}
        y2={-20}
        stroke={center}
        strokeWidth={2.5}
        strokeLinecap="round"
        transform={`rotate(${i * 72 + 36})`}
      />
    ))}
    <circle r={9} fill={center} />
  </svg>
);

export const Star4: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="-50 -50 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }}>
    <path d="M0,-50 C6,-10 10,-6 50,0 C10,6 6,10 0,50 C-6,10 -10,6 -50,0 C-10,-6 -6,-10 0,-50Z" fill={color} />
  </svg>
);

/** Hoa mai + hoa đào rơi */
export const FallingBlossoms: React.FC<{ t: number; opacity: number; count?: number }> = ({
  t,
  opacity,
  count = 16,
}) => {
  if (opacity <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const speed = 110 + random(`sp${i}`) * 120;
        const size = 34 + random(`sz${i}`) * 34;
        const x0 = random(`x${i}`) * 1080;
        const off = random(`o${i}`) * 2100;
        const y = ((t * speed + off) % 2150) - 120;
        const x = x0 + Math.sin(t * (0.8 + random(`w${i}`)) + i) * 50;
        const rot = t * (40 + random(`r${i}`) * 80) * (i % 2 ? 1 : -1);
        const mai = i % 3 !== 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `rotate(${rot}deg)`,
              opacity: 0.75 + random(`a${i}`) * 0.25,
              filter: "drop-shadow(0 4px 6px rgba(80,0,0,0.25))",
            }}
          >
            <Blossom size={size} petal={mai ? "#FFC83D" : "#FF9EC0"} center={mai ? "#E8890C" : "#D6336C"} />
          </div>
        );
      })}
    </div>
  );
};

/** Nền đỏ Tết có hoa văn chấm vàng và tia sáng quay */
export const TetBackground: React.FC<{ t: number }> = ({ t }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at 50% 38%, #F2473F 0%, #C9152F 52%, #8A0B22 100%)",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: -500,
        top: 664 - 1100,
        width: 2080,
        height: 2200,
        background:
          "repeating-conic-gradient(from 0deg, rgba(255,214,102,0.10) 0deg 9deg, rgba(255,214,102,0) 9deg 22.5deg)",
        transform: `rotate(${t * 6}deg)`,
        WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 62%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(rgba(255,214,102,0.22) 2.4px, transparent 3px)",
        backgroundSize: "42px 42px",
        backgroundPosition: `0 ${t * 12}px`,
      }}
    />
  </div>
);

/** Đèn lồng treo đung đưa */
export const Lantern: React.FC<{ x: number; t: number; drop: number; phase: number; len: number; size: number }> = ({
  x,
  t,
  drop,
  phase,
  len,
  size,
}) => {
  const swing = Math.sin(t * 2.2 + phase) * 7;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: -20 - (1 - drop) * 420,
        width: size,
        transformOrigin: `${size / 2}px 0px`,
        transform: `rotate(${swing}deg)`,
      }}
    >
      <div style={{ marginLeft: size / 2 - 2, width: 4, height: len, background: "#FFD166", borderRadius: 2 }} />
      <Emoji name="lantern" size={size} style={{ marginTop: -size * 0.12, filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.35))" }} />
    </div>
  );
};
