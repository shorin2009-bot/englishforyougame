import React from "react";
import { Img, random, staticFile, useCurrentFrame } from "remotion";
import { BODY, TITLE } from "./fonts";
import { FPS, V } from "./timeline";
import { Emoji, Outline, Star4, clamp, easeIn, easeInOut, easeOut, lerp, life, pop } from "./ui";

// ---------------- Ảnh sách + camera ----------------
const BOOK_W = 1732;
const BOOK_H = 1214;
export const WIN = { y: 400, w: 1080, h: 1070 }; // cửa sổ camera trên màn hình

type Key = [t: number, cx: number, cy: number, s: number, rot: number];
const CAM: Key[] = [
  [0.0, 866, 607, 0.574, 0],
  [1.45, 866, 607, 0.574, 0],
  [2.55, 322, 700, 2.05, -1.2],
  [4.6, 322, 850, 2.12, -1.2],
  [7.5, 322, 925, 2.18, 0],
  [8.9, 322, 925, 2.18, 0],
  [9.7, 866, 607, 0.574, 0],
];

const camAt = (t: number) => {
  if (t <= CAM[0][0]) return CAM[0];
  for (let i = 0; i < CAM.length - 1; i++) {
    const a = CAM[i];
    const b = CAM[i + 1];
    if (t < b[0]) {
      const p = easeInOut((t - a[0]) / (b[0] - a[0]));
      return [
        t,
        a[1] + (b[1] - a[1]) * p,
        a[2] + (b[2] - a[2]) * p,
        Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * p),
        a[4] + (b[4] - a[4]) * p,
      ] as Key;
    }
  }
  return CAM[CAM.length - 1];
};

// mức xám của trang sách: chán dần rồi được "đũa thần" trả màu
const WIPE: [number, number] = [7.7, 8.9];
const wipeX = (t: number) => lerp(t, WIPE[0], WIPE[1], -25, 125); // % chiều ngang cửa sổ
const greyAt = (t: number) => lerp(t, 3.0, 4.7, 0, 1);

const BookWorld: React.FC<{ t: number; dropY: number; grey: number }> = ({ t, dropY, grey }) => {
  const [, cx, cy, s, rot] = camAt(t);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: BOOK_W,
        height: BOOK_H,
        transformOrigin: "0 0",
        transform: `translate(${WIN.w / 2}px, ${WIN.h / 2 + dropY}px) rotate(${rot}deg) scale(${s}) translate(${-cx}px, ${-cy}px)`,
      }}
    >
      <Img
        src={staticFile("book.jpg")}
        style={{
          width: BOOK_W,
          height: BOOK_H,
          borderRadius: 26,
          boxShadow: "0 30px 70px rgba(70,30,0,0.35)",
          filter: grey > 0 ? `grayscale(${grey}) contrast(${1 - 0.12 * grey}) brightness(${1 - 0.06 * grey})` : undefined,
        }}
      />
    </div>
  );
};

const Book: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t > 10.7) return null;
  const drop = pop(frame, 0, 12, 120, 0.9);
  const dropY = (1 - drop) * -620;
  const grey = greyAt(t);
  const x = wipeX(t);
  // thu nhỏ trang sách vào khung TV
  const shrink = lerp(t, 10.1, 10.6, 0, 1, easeIn);
  const mask =
    "linear-gradient(to bottom, transparent 0px, black 46px, black calc(100% - 70px), transparent 100%)";
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: WIN.y,
        width: WIN.w,
        height: WIN.h,
        transformOrigin: "540px 264px",
        transform: `scale(${1 - 0.65 * shrink}) rotate(${shrink * -8}deg)`,
        opacity: 1 - shrink,
      }}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitMaskImage: mask }}>
        <BookWorld t={t} dropY={dropY} grey={grey} />
      </div>
      {t >= WIPE[0] && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            WebkitMaskImage: mask,
            clipPath: `polygon(0% 0%, ${x}% 0%, ${x - 25}% 100%, 0% 100%)`,
          }}
        >
          <BookWorld t={t} dropY={dropY} grey={0} />
        </div>
      )}
    </div>
  );
};

// ---------------- Nền phần hook ----------------
export const HookBackground: React.FC<{ t: number }> = ({ t }) => {
  const grey = greyAt(t) * (1 - lerp(t, WIPE[0], WIPE[1], 0, 1));
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg,#FFF8EA 0%,#FFE6D3 100%)" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255,150,120,0.35) 3px, transparent 3.5px)",
          backgroundSize: "46px 46px",
          backgroundPosition: `${t * 10}px ${t * 14}px`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "#CFCFD4", opacity: grey * 0.85 }} />
    </div>
  );
};

// ---------------- Tiêu đề phần hook ----------------
const lineStyle = (size: number): React.CSSProperties => ({
  fontFamily: TITLE,
  fontWeight: 800,
  fontSize: size,
  lineHeight: 1.05,
  whiteSpace: "nowrap",
});

const PopLine: React.FC<{ frame: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  frame,
  at,
  children,
  style,
}) => {
  const p = pop(frame, at, 10, 190, 0.7);
  return (
    <div
      style={{
        transform: `scale(${0.55 + 0.45 * p}) translateY(${(1 - p) * 30}px)`,
        opacity: Math.min(1, p * 2),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const HeaderBox: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) => {
  if (t < a - 0.05 || t > b) return null;
  const out = lerp(t, b - 0.18, b, 0, 1, easeIn);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        width: 880,
        top: 168,
        height: 236,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        transform: `scale(${1 - 0.25 * out})`,
        opacity: 1 - out,
      }}
    >
      {children}
    </div>
  );
};

const HookHeaders: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const markerP = lerp(t, 1.15, 1.55, 0, 1, easeOut);
  return (
    <>
      {/* 1. Câu hook */}
      <HeaderBox t={t} a={0} b={V(4.62)}>
        <PopLine frame={frame} at={-0.12}>
          <span style={{ ...lineStyle(76), color: "#2E2A4F" }}>Vẫn cho học sinh đọc</span>
        </PopLine>
        <PopLine frame={frame} at={0.85}>
          <span style={{ ...lineStyle(86), color: "#2E2A4F", position: "relative" }}>
            hội thoại{" "}
            <span style={{ position: "relative", display: "inline-block" }}>
              <span
                style={{
                  position: "absolute",
                  left: -10,
                  right: -10,
                  bottom: 10,
                  height: 38,
                  background: "#FFD23F",
                  borderRadius: 12,
                  transformOrigin: "left center",
                  transform: `scaleX(${markerP}) rotate(-1.5deg)`,
                }}
              />
              <span style={{ position: "relative", color: "#E63946" }}>kiểu này?</span>
            </span>
          </span>
          <div style={{ transform: `scale(${pop(frame, V(2.73))}) rotate(${Math.sin(t * 5) * 8}deg)` }}>
            <Emoji name="think" size={104} />
          </div>
        </PopLine>
      </HeaderBox>

      {/* 2. ĐỪNG NHA! Chán lắm! */}
      <HeaderBox t={t} a={V(4.66)} b={7.55}>
        <PopLine frame={frame} at={V(4.66)}>
          <Outline
            stroke="#FFFFFF"
            width={9}
            color="#E63946"
            style={lineStyle(132)}
            shadow="0 10px 0 rgba(150,20,40,0.25)"
          >
            ĐỪNG NHA!
          </Outline>
          <div style={{ transform: `scale(${pop(frame, V(4.8))}) rotate(${Math.sin(t * 7) * 6}deg)` }}>
            <Emoji name="nope" size={124} />
          </div>
        </PopLine>
        <PopLine frame={frame} at={V(5.79)} style={{ marginTop: -6 }}>
          <span style={{ ...lineStyle(80), color: "#2E2A4F" }}>Chán lắm!</span>
          <Emoji name="tired" size={92} style={{ transform: `rotate(${Math.sin(t * 3) * 10}deg)` }} />
        </PopLine>
      </HeaderBox>

      {/* 3. Biến thành VIDEO SINH ĐỘNG */}
      <HeaderBox t={t} a={7.6} b={V(11.0)}>
        <PopLine frame={frame} at={7.6}>
          <Outline stroke="#3A1452" width={7} color="#FFFFFF" style={lineStyle(76)}>
            Hãy biến nó thành
          </Outline>
        </PopLine>
        <PopLine frame={frame} at={8.55}>
          <Outline
            stroke="#3A1452"
            width={9}
            color="#FFD23F"
            style={lineStyle(104)}
            shadow="0 9px 0 rgba(58,20,82,0.45)"
          >
            VIDEO SINH ĐỘNG
          </Outline>
          <div style={{ transform: `scale(${pop(frame, 8.75)}) rotate(${t * 40}deg)` }}>
            <Emoji name="sparkles" size={96} />
          </div>
        </PopLine>
      </HeaderBox>

      {/* 4. Hahaha */}
      <HeaderBox t={t} a={V(11.0)} b={12.42}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {"Hahaha!".split("").map((ch, i) => {
            const p = pop(frame, V(11.0) + i * 0.05, 8, 220, 0.6);
            const bob = Math.sin(t * 14 + i) * 8;
            return (
              <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - p) * 80 + bob}px) scale(${p})` }}>
                <Outline stroke="#3A1452" width={9} color="#FFD23F" style={lineStyle(140)}>
                  {ch}
                </Outline>
              </span>
            );
          })}
          <div style={{ transform: `scale(${pop(frame, V(11.3))}) rotate(${Math.sin(t * 12) * 14}deg)`, marginLeft: 10 }}>
            <Emoji name="rofl" size={130} />
          </div>
        </div>
      </HeaderBox>
    </>
  );
};

// ---------------- Hiệu ứng "chán" ----------------
const ZZZ: [number, number, number][] = [
  [3.45, 300, 1130],
  [3.95, 650, 1080],
  [4.45, 460, 1240],
  [5.0, 770, 1160],
  [5.55, 240, 1210],
  [6.2, 560, 1120],
  [6.75, 380, 1230],
];

const Boredom: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t < 3.3 || t > 9.8) return null;
  const fade = lerp(t, 7.6, 8.0, 1, 0);
  const yawnIn = pop(frame, 3.7, 12, 140);
  const yawnOut = lerp(t, 7.7, 8.1, 0, 1, easeIn);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: fade }}>
        {ZZZ.map(([at, x, y], i) => {
          const k = (t - at) / 1.7;
          if (k < 0 || k > 1) return null;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x + Math.sin(k * 6 + i) * 30,
                top: y - k * 280,
                opacity: Math.min(1, k * 6, (1 - k) * 3),
                transform: `scale(${0.7 + k * 0.6}) rotate(${-10 + k * 20}deg)`,
              }}
            >
              <Emoji name="zzz" size={100} />
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 34,
          top: 1290 + (1 - yawnIn) * 320 + yawnOut * 400,
          transform: `rotate(${Math.sin(t * 3.5) * 8}deg)`,
          filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.25))",
        }}
      >
        <Emoji name="yawn" size={170} />
      </div>
    </>
  );
};

// ---------------- Thanh đo: Độ chán -> Độ hứng thú ----------------
const Meter: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t < 3.0 || t > 10.0) return null;
  const inP = pop(frame, 3.1, 13, 150);
  const out = lerp(t, 9.45, 9.85, 0, 1, easeIn);
  const fun = t >= 7.9;
  const fill = fun ? lerp(t, 8.0, 9.2, 0, 1, easeOut) : lerp(t, 3.3, V(5.79), 0.05, 1, easeIn);
  const maxShake = !fun && t > V(5.79) ? Math.sin(t * 60) * 5 * Math.max(0, 1 - (t - V(5.79)) / 0.6) : 0;
  const label = fun ? "Độ hứng thú" : "Độ chán";
  return (
    <div
      style={{
        position: "absolute",
        left: 220,
        top: 1372,
        width: 690,
        height: 84,
        borderRadius: 42,
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        padding: "0 22px 0 14px",
        gap: 12,
        transform: `translateY(${(1 - inP) * 220 + out * 260}px) translateX(${maxShake}px)`,
        opacity: 1 - out,
      }}
    >
      <Emoji name={fun ? "starstruck" : "sleepy"} size={60} />
      <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#2E2A4F", whiteSpace: "nowrap", width: 196 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 30, borderRadius: 15, background: "#ECE7F2", overflow: "hidden" }}>
        <div
          style={{
            width: `${fill * 100}%`,
            height: "100%",
            borderRadius: 15,
            background: fun
              ? "linear-gradient(90deg,#3DDC97,#FFD23F)"
              : "linear-gradient(90deg,#FFB020,#E63946)",
          }}
        />
      </div>
      <span style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 34, width: 86, textAlign: "right", color: fun ? "#12A36B" : "#E63946" }}>
        {fill > 0.99 ? "MAX" : `${Math.round(fill * 100)}%`}
      </span>
    </div>
  );
};

// ---------------- Con dấu BORING! ----------------
const Stamp: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const at = V(5.79);
  if (t < at || t > 8.6) return null;
  const p = pop(frame, at, 14, 260, 0.7);
  const out = lerp(t, 8.15, 8.45, 0, 1, easeIn);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 330,
        top: 900,
        width: 660,
        height: 230,
        transform: `rotate(-13deg) scale(${(2.6 - 1.6 * p) * (1 + out * 0.4)})`,
        opacity: Math.min(1, p * 3) * (1 - out),
      }}
    >
      <svg width={660} height={230} viewBox="0 0 660 230" style={{ overflow: "visible" }}>
        <defs>
          <filter id="rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
          </filter>
        </defs>
        <g filter="url(#rough)" opacity={0.93}>
          <rect x={8} y={8} width={644} height={214} rx={30} fill="rgba(255,255,255,0.55)" stroke="#E11D48" strokeWidth={12} />
          <rect x={26} y={26} width={608} height={178} rx={20} fill="none" stroke="#E11D48" strokeWidth={4} />
          <text
            x={330}
            y={160}
            textAnchor="middle"
            fontFamily="Baloo 2"
            fontWeight={800}
            fontSize={136}
            fill="#E11D48"
            letterSpacing={4}
          >
            BORING!
          </text>
        </g>
      </svg>
    </div>
  );
};

// ---------------- Đũa thần + vệt lấp lánh ----------------
const tipAt = (time: number) => {
  const x = ((wipeX(time) - 12.5) / 100) * 1080;
  const y = WIN.y + 480 + Math.sin(time * 7) * 70;
  return { x, y };
};

const Wand: React.FC<{ t: number }> = ({ t }) => {
  if (t < 7.55 || t > 9.3) return null;
  const vis = life(t, 7.55, 9.25, 0.12, 0.3);
  const tip = tipAt(Math.min(t, WIPE[1]));
  const births: number[] = [];
  for (let b = WIPE[0]; b <= Math.min(t, WIPE[1]); b += 1 / 30) births.push(b);
  return (
    <>
      {births.map((b, i) => {
        const age = (t - b) / 0.75;
        if (age > 1) return null;
        const p = tipAt(b);
        const size = 26 + random(`s${i}`) * 46;
        const dx = (random(`dx${i}`) - 0.5) * 120 * age;
        const dy = (random(`dy${i}`) - 0.2) * 140 * age;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + dx - size / 2,
              top: p.y + dy - size / 2,
              transform: `rotate(${age * 140}deg) scale(${1 - age * 0.8})`,
              opacity: 1 - age,
              filter: "drop-shadow(0 0 10px rgba(255,220,120,0.9))",
            }}
          >
            <Star4 size={size} color={i % 3 === 0 ? "#FFFFFF" : i % 3 === 1 ? "#FFD23F" : "#FF9EC0"} />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: tip.x - 30,
          top: tip.y - 30,
          opacity: vis,
          transformOrigin: "30px 30px",
          transform: `rotate(${-20 + Math.sin(t * 9) * 12}deg)`,
          filter: "drop-shadow(0 12px 18px rgba(60,0,80,0.4))",
        }}
      >
        <Emoji name="wand" size={210} style={{ transform: "translate(-12px,-12px)" }} />
      </div>
    </>
  );
};

// ---------------- Bong bóng tên nhân vật bay ra từ sách ----------------
const Bubble: React.FC<{ frame: number; t: number; at: number; x: number; y: number; color: string; text: string; tail: "left" | "right" }> = ({
  frame,
  t,
  at,
  x,
  y,
  color,
  text,
  tail,
}) => {
  if (t < at || t > 10.6) return null;
  const p = pop(frame, at, 9, 200, 0.7);
  const out = lerp(t, 10.1, 10.5, 0, 1, easeIn);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + Math.sin(t * 4 + x) * 8,
        transformOrigin: tail === "left" ? "20% 100%" : "80% 100%",
        transform: `scale(${p * (1 - out)})`,
      }}
    >
      <div
        style={{
          background: color,
          color: "white",
          fontFamily: TITLE,
          fontWeight: 800,
          fontSize: 54,
          padding: "6px 34px 0",
          borderRadius: 40,
          border: "6px solid white",
          boxShadow: "0 12px 24px rgba(0,0,0,0.25)",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: "absolute",
          [tail]: 46,
          bottom: -26,
          width: 0,
          height: 0,
          borderLeft: "18px solid transparent",
          borderRight: "18px solid transparent",
          borderTop: `30px solid white`,
        }}
      />
    </div>
  );
};

// ---------------- Mưa emoji cười ----------------
const LAUGH = ["joy", "rofl", "laugh", "joy", "rofl", "joy", "laugh", "rofl", "joy", "laugh", "rofl", "joy", "joy", "laugh"];
const LaughRain: React.FC<{ t: number }> = ({ t }) => {
  const at = V(11.0);
  if (t < at || t > at + 2.6) return null;
  return (
    <>
      {LAUGH.map((name, i) => {
        const start = at + random(`ls${i}`) * 0.6;
        const k = (t - start) / 1.9;
        if (k < 0 || k > 1) return null;
        const size = 110 + random(`lz${i}`) * 90;
        const x = 30 + random(`lx${i}`) * 880;
        const y = 1960 - easeOut(k) * 2250;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `rotate(${(random(`lr${i}`) - 0.5) * 60 + Math.sin(t * 10 + i) * 12}deg)`,
              filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.25))",
            }}
          >
            <Emoji name={name} size={size} />
          </div>
        );
      })}
    </>
  );
};

export const HookLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <>
      <Book t={t} frame={frame} />
      <Boredom t={t} frame={frame} />
      <Stamp t={t} frame={frame} />
      <Meter t={t} frame={frame} />
      <Wand t={t} />
      <Bubble frame={frame} t={t} at={9.55} x={130} y={830} color="#FF6FA5" text="Elena" tail="right" />
      <Bubble frame={frame} t={t} at={9.75} x={560} y={800} color="#19A7A0" text="Trang" tail="left" />
      <HookHeaders t={t} frame={frame} />
      <LaughRain t={t} />
    </>
  );
};

