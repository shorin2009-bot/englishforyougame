import React from "react";
import { Img, OffthreadVideo, Sequence, random, staticFile, useCurrentFrame } from "remotion";
import { BODY, TITLE } from "./fonts";
import { FPS, SHIFT, SHIFT_F, V } from "./timeline";
import { Emoji, Outline, Star4, clamp, easeIn, easeInOut, easeOut, lerp, life, pop } from "./ui";

// ---------------- Ảnh sách + camera ----------------
const BOOK_W = 1732;
const BOOK_H = 1214;
export const WIN = { y: 400, w: 1080, h: 1070 }; // cửa sổ camera trên màn hình

type Key = [t: number, cx: number, cy: number, s: number, rot: number];
const CAM: Key[] = [
  [0.0, 866, 607, 0.574, 0],
  [2.15, 866, 607, 0.574, 0],
  [3.05, 322, 700, 2.05, -1.2],
  [4.8, 322, 850, 2.12, -1.2],
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
const greyAt = (t: number) => lerp(t, 3.2, 4.8, 0, 1);

// ---------------- Hiệu ứng "đọc từng dòng" trên trang sách ----------------
// Toạ độ (px trong ảnh sách) của từng dòng hội thoại: [y giữa dòng, x mép phải]
const TEXT_X = 113;
const LINE_H = 21;
type Turn = { who: "Elena" | "Trang"; lines: [number, number][] };
const TURNS: Turn[] = [
  { who: "Elena", lines: [[599, 372]] },
  { who: "Trang", lines: [[628, 519], [648, 519], [667, 490]] },
  { who: "Elena", lines: [[696, 519], [715, 340]] },
  { who: "Trang", lines: [[744, 489], [763, 426]] },
  { who: "Elena", lines: [[792, 424], [811, 426]] },
  { who: "Trang", lines: [[840, 462], [859, 446], [878, 368]] },
];
const READ_START = 2.75;
const LINE_DUR = 0.19;
const TURN_COLOR = { Elena: "#FFE14D", Trang: "#7FF0D8" } as const;

// mốc bắt đầu/kết thúc của từng dòng và từng lượt
const LINES = TURNS.flatMap((turn, ti) => turn.lines.map(([y, r]) => ({ ti, y, r })));
const lineStart = (i: number) => READ_START + i * LINE_DUR;
const TURN_SPAN = TURNS.map((_, ti) => {
  const idx = LINES.map((l, i) => (l.ti === ti ? i : -1)).filter((i) => i >= 0);
  return [lineStart(idx[0]), lineStart(idx[idx.length - 1]) + LINE_DUR] as [number, number];
});
const READ_END = lineStart(LINES.length);

const Highlight: React.FC<{ i: number; t: number; dx: number; dy: number; grey: number }> = ({ i, t, dx, dy, grey }) => {
  const l = LINES[i];
  const p = lerp(t, lineStart(i), lineStart(i) + LINE_DUR, 0, 1, (x) => x);
  if (p <= 0) return null;
  const [, end] = TURN_SPAN[l.ti];
  const fade = lerp(t, end, end + 0.6, 1, 0.35);
  return (
    <div
      style={{
        position: "absolute",
        left: TEXT_X - 4 - dx,
        top: l.y - LINE_H / 2 - dy,
        width: (l.r - TEXT_X + 10) * p,
        height: LINE_H,
        borderRadius: 6,
        background: TURN_COLOR[TURNS[l.ti].who],
        mixBlendMode: "multiply",
        opacity: 0.95 * fade * (1 - 0.35 * grey),
      }}
    />
  );
};

const ReadingFx: React.FC<{ t: number; frame: number; grey: number }> = ({ t, frame, grey }) => {
  if (t < READ_START || t > 5.3) return null;
  // lượt thoại đang đọc
  const active = TURN_SPAN.findIndex(([a, b]) => t >= a && t < b + 0.12);
  const cur = Math.min(LINES.length - 1, Math.floor((t - READ_START) / LINE_DUR));
  const lp = lerp(t, lineStart(cur), lineStart(cur) + LINE_DUR, 0, 1, (x) => x);
  const fingerX = TEXT_X + (LINES[cur].r - TEXT_X) * lp;
  const fingerY = LINES[cur].y + 4;
  const fingerVis = life(t, READ_START, 4.95, 0.15, 0.3);
  return (
    <>
      {/* vệt dạ quang của các lượt đã đọc (nằm trên trang) */}
      {LINES.map((l, i) => (l.ti === active ? null : <Highlight key={i} i={i} t={t} dx={0} dy={0} grey={grey} />))}
      {/* lượt đang đọc nổi lên khỏi trang */}
      {active >= 0 &&
        (() => {
          const turn = TURNS[active];
          const [a, b] = TURN_SPAN[active];
          const up = Math.min(pop(frame, a, 12, 220, 0.6), lerp(t, b, b + 0.12, 1, 0));
          const top = turn.lines[0][0] - LINE_H / 2 - 7;
          const bottom = turn.lines[turn.lines.length - 1][0] + LINE_H / 2 + 7;
          const left = TEXT_X - 10;
          const width = Math.max(...turn.lines.map((l) => l[1])) - left + 14;
          const color = turn.who === "Elena" ? "#FF5C9A" : "#14A39B";
          return (
            <div
              style={{
                position: "absolute",
                left,
                top,
                width,
                height: bottom - top,
                borderRadius: 8,
                overflow: "hidden",
                backgroundImage: `url(${staticFile("book.jpg")})`,
                backgroundSize: `${BOOK_W}px ${BOOK_H}px`,
                backgroundPosition: `${-left}px ${-top}px`,
                transform: `translate(${-3 * up}px, ${-5 * up}px) scale(${1 + 0.045 * up})`,
                boxShadow: `0 ${8 * up}px ${16 * up}px rgba(40,20,60,${0.35 * up}), 0 0 0 ${2.5 * up}px ${color}`,
              }}
            >
              {LINES.map((l, i) =>
                l.ti === active ? <Highlight key={i} i={i} t={t} dx={left} dy={top} grey={grey} /> : null,
              )}
            </div>
          );
        })()}
      {/* ngón tay dò theo dòng chữ */}
      <div
        style={{
          position: "absolute",
          left: fingerX - 40,
          top: fingerY,
          opacity: fingerVis,
          transform: `rotate(-28deg) translateY(${Math.sin(t * 18) * 1.5}px)`,
          filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.3))",
        }}
      >
        <Emoji name="point" size={46} />
      </div>
    </>
  );
};

// ---------------- Mở đầu: bìa sách -> mở bìa -> lật trang tới Unit 5 ----------------
// Vị trí bản ghi lật trang (flip.mp4) trong toạ độ ảnh sách (đo bằng so khớp ảnh)
const REC = { x: 1.69, y: -3.9, w: 1792.2, h: 1237.6 };
const HALF = BOOK_W / 2; // gáy sách
const OPEN: [number, number] = [-0.22, 0.42]; // mở bìa
const FLIP_TRIM = 0.7; // bỏ 0.7 giây đứng yên đầu bản ghi
const FLIP_RATE = 1.6; // tua nhanh lật trang
const FLIP_END = 2.2;
export const COVER_SHIFT = (BOOK_W * 0.75 - HALF) * 0.574; // dời sách đóng vào giữa màn hình

const pageBg = (dx: number): React.CSSProperties => ({
  backgroundImage: `url(${staticFile("flip-first.jpg")})`,
  backgroundSize: `${REC.w}px ${REC.h}px`,
  backgroundPosition: `${REC.x - dx}px ${REC.y}px`,
});

const FlipIntro: React.FC<{ t: number }> = ({ t }) => {
  if (t > FLIP_END) return null;
  const open = lerp(t, OPEN[0], OPEN[1], 0, 1, easeInOut);
  const shade = Math.sin(open * Math.PI);
  const closed = t < OPEN[1];
  const glare = lerp(t, -0.52, -0.12, 120, -20, easeInOut);
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 2600, perspectiveOrigin: `${HALF}px ${BOOK_H / 2}px` }}>
      {closed && (
        <>
          {/* độ dày khối giấy */}
          <div
            style={{
              position: "absolute",
              left: HALF + 10,
              top: 10,
              width: HALF,
              height: BOOK_H,
              background: "repeating-linear-gradient(90deg,#F4EFE4 0 3px,#E2D9C6 3px 5px)",
              borderRadius: "6px 20px 20px 6px",
              boxShadow: "0 30px 70px rgba(70,30,0,0.4)",
            }}
          />
          {/* trang phải nằm dưới bìa */}
          <div style={{ position: "absolute", left: HALF, top: 0, width: HALF, height: BOOK_H, ...pageBg(HALF) }} />
        </>
      )}
      {t >= OPEN[1] && (
        <Sequence from={SHIFT_F + Math.round(OPEN[1] * FPS)} durationInFrames={Math.round((FLIP_END - OPEN[1]) * FPS)} layout="none">
          <OffthreadVideo
            src={staticFile("flip.mp4")}
            trimBefore={Math.round(FLIP_TRIM * FPS)}
            playbackRate={FLIP_RATE}
            muted
            style={{
              position: "absolute",
              left: REC.x,
              top: REC.y,
              width: REC.w,
              height: REC.h,
              boxShadow: "0 30px 70px rgba(70,30,0,0.35)",
            }}
          />
        </Sequence>
      )}
      {closed && (
        <div
          style={{
            position: "absolute",
            left: HALF,
            top: 0,
            width: HALF,
            height: BOOK_H,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            transform: `rotateY(${-180 * open}deg)`,
          }}
        >
          {/* mặt trước: bìa sách */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: "4px 18px 18px 4px", overflow: "hidden" }}>
            <Img src={staticFile("cover.jpg")} style={{ width: HALF, height: BOOK_H, display: "block" }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 6%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 60%)",
                backgroundSize: "300% 100%",
                backgroundPosition: `${glare}% 0%`,
              }}
            />
            <div style={{ position: "absolute", inset: 0, background: "#000", opacity: shade * 0.35 }} />
          </div>
          {/* mặt sau: trang trái của sách */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              ...pageBg(0),
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "#000", opacity: shade * 0.3 }} />
          </div>
        </div>
      )}
    </div>
  );
};

const BookWorld: React.FC<{
  t: number;
  frame: number;
  dropY: number;
  grey: number;
  rx: number;
  enter: number;
  dx: number;
  intro: boolean;
}> = ({ t, frame, dropY, grey, rx, enter, dx, intro }) => {
  const [, cx, cy, s, rot] = camAt(t);
  const greyFilter =
    grey > 0 ? `grayscale(${grey}) contrast(${1 - 0.12 * grey}) brightness(${1 - 0.06 * grey})` : undefined;
  const pageIn = lerp(t, 1.95, 2.15, 0, 1);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: BOOK_W,
        height: BOOK_H,
        transformOrigin: "0 0",
        transform: `translate(${WIN.w / 2 + dx}px, ${WIN.h / 2 + dropY}px) rotateX(${rx}deg) rotate(${rot}deg) scale(${s * enter}) translate(${-cx}px, ${-cy}px)`,
      }}
    >
      {intro && <FlipIntro t={t} />}
      {pageIn > 0 && (
        <Img
          src={staticFile("book.jpg")}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: BOOK_W,
            height: BOOK_H,
            borderRadius: 26,
            boxShadow: "0 30px 70px rgba(70,30,0,0.35)",
            filter: greyFilter,
            opacity: pageIn,
          }}
        />
      )}
      <ReadingFx t={t} frame={frame} grey={grey} />
    </div>
  );
};

// ngôi sao lấp lánh khi sách đáp xuống
const LAND_SPARKS: [number, number, number][] = [
  [272, 600, 62],
  [806, 622, 48],
  [252, 1262, 46],
  [812, 1272, 64],
  [540, 566, 40],
];
const LandSparkles: React.FC<{ t: number }> = ({ t }) => {
  if (t < -0.4 || t > 0.6) return null;
  return (
    <>
      {LAND_SPARKS.map(([x, y, s], i) => {
        const k = lerp(t, -0.4 + i * 0.05, 0.3 + i * 0.05, 0, 1, (v) => v);
        const sc = Math.sin(k * Math.PI);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - s / 2,
              top: y - s / 2,
              transform: `scale(${sc}) rotate(${k * 120}deg)`,
              filter: "drop-shadow(0 0 10px rgba(255,200,80,0.9))",
            }}
          >
            <Star4 size={s} color={i % 2 ? "#FFD23F" : "#FFFFFF"} />
          </div>
        );
      })}
    </>
  );
};

const Book: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t > 10.7) return null;
  const drop = pop(frame, -SHIFT, 13, 110, 0.9);
  const dropY = (1 - drop) * -260;
  const rx = (1 - drop) * 42; // lật 3D từ nằm nghiêng lên
  const enter = 0.86 + 0.14 * drop;
  const dx = -COVER_SHIFT * (1 - lerp(t, OPEN[0], OPEN[1], 0, 1, easeInOut));
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
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitMaskImage: mask, perspective: 1700 }}>
        <BookWorld t={t} frame={frame} dropY={dropY} grey={grey} rx={rx} enter={enter} dx={dx} intro />
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
          <BookWorld t={t} frame={frame} dropY={dropY} grey={0} rx={rx} enter={enter} dx={dx} intro={false} />
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
      <HeaderBox t={t} a={-0.9} b={V(4.62)}>
        <PopLine frame={frame} at={-0.72}>
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
  const frame = useCurrentFrame() - SHIFT_F;
  const t = frame / FPS;
  return (
    <>
      <Book t={t} frame={frame} />
      <LandSparkles t={t} />
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

