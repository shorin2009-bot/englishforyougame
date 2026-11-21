import React from "react";
import { Img, OffthreadVideo, Sequence, random, staticFile, useCurrentFrame } from "remotion";
import { BODY, TITLE } from "./fonts";
import { CARDS, CLIP_F, CLIP_LEN, CLIP_START_F, CS, Card, FPS, GUESS_COUNT, REVEAL_AT, SHIFT_F, SUBS } from "./timeline";
import { Emoji, Outline, easeIn, easeOut, lerp, life, pop } from "./ui";

// ---------------- Bố cục khung TV ----------------
export const TV = { x: 20, y: 430, w: 1040, pad: 10, clipH: 449, subH: 172 };
const CLIP_W = TV.w - TV.pad * 2; // 1020
const CLIP_FULL_H = Math.round((CLIP_W * 1080) / 1920); // 574 – cắt bỏ dải phụ đề cũ ở đáy clip
export const TV_H = TV.clipH + TV.subH + TV.pad * 2;
export const TV_CENTER = { x: TV.x + TV.w / 2, y: TV.y + TV.pad + TV.clipH / 2 };

const WHO_COLOR = { Elena: "#FF5C9A", Trang: "#14A39B" } as const;

// ---------------- Phụ đề ----------------
const SubBar: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const ct = t - CS;
  if (ct < 0) {
    // trước khi clip chạy
    const p = pop(frame, 10.55);
    return (
      <div style={{ ...subWrap, opacity: p }}>
        <div style={{ ...subText, fontSize: 52, color: "#8A4B2A", display: "flex", alignItems: "center", gap: 14 }}>
          <Emoji name="clapper" size={70} /> Let's watch!
        </div>
      </div>
    );
  }
  let idx = 0;
  SUBS.forEach((s, i) => {
    if (ct >= s.at) idx = i;
  });
  const sub = SUBS[idx];
  const p = pop(frame, CS + sub.at, 14, 220, 0.6);
  return (
    <div style={subWrap}>
      <div
        style={{
          position: "absolute",
          left: 36,
          top: -26,
          background: WHO_COLOR[sub.who],
          color: "white",
          fontFamily: TITLE,
          fontWeight: 800,
          fontSize: 34,
          padding: "2px 24px 0",
          borderRadius: 24,
          border: "4px solid white",
          boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
          transform: `scale(${0.6 + 0.4 * p})`,
          transformOrigin: "left center",
        }}
      >
        {sub.who}
      </div>
      <div style={{ ...subText, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 22}px)` }}>
        {sub.parts.map((part, i) =>
          typeof part === "string" ? (
            <span key={i}>{part}</span>
          ) : (
            <span
              key={i}
              style={{
                color: "#D3122E",
                backgroundImage: "linear-gradient(transparent 62%, #FFE066 62%)",
                padding: "0 4px",
                borderRadius: 6,
              }}
            >
              {part.hl}
            </span>
          ),
        )}
      </div>
    </div>
  );
};

const subWrap: React.CSSProperties = {
  position: "absolute",
  left: TV.pad,
  top: TV.pad + TV.clipH,
  width: CLIP_W,
  height: TV.subH,
  background: "linear-gradient(180deg,#FFFBF2,#FFF1DC)",
  borderRadius: "0 0 26px 26px",
  display: "flex",
  alignItems: "center",
  // chừa lề phải cho cột nút của TikTok
  padding: "14px 120px 6px 46px",
  boxSizing: "border-box",
};

const subText: React.CSSProperties = {
  fontFamily: TITLE,
  fontWeight: 700,
  fontSize: 46,
  lineHeight: 1.16,
  color: "#2E2A4F",
  width: "100%",
  textAlign: "center",
};

// ---------------- Khung TV chứa clip ----------------
const TVFrame: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t < 10.25) return null;
  const p = pop(frame, 10.3, 12, 160, 0.9);
  const bob = t > CS ? 0 : Math.sin(t * 3) * 4;
  return (
    <div
      style={{
        position: "absolute",
        left: TV.x,
        top: TV.y + bob,
        width: TV.w,
        height: TV_H,
        borderRadius: 36,
        background: "linear-gradient(135deg,#FFE08A 0%,#FFC23D 45%,#F59E0B 100%)",
        boxShadow: "0 24px 60px rgba(60,0,10,0.45), inset 0 0 0 3px rgba(255,255,255,0.6)",
        transformOrigin: "50% 40%",
        transform: `scale(${0.35 + 0.65 * p})`,
        opacity: Math.min(1, p * 2.5),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: TV.pad,
          top: TV.pad,
          width: CLIP_W,
          height: TV.clipH,
          overflow: "hidden",
          borderRadius: "26px 26px 0 0",
          background: "#000",
        }}
      >
        {t < CS && <Img src={staticFile("clip-first.jpg")} style={{ width: CLIP_W, height: CLIP_FULL_H }} />}
        <Sequence from={CLIP_START_F + SHIFT_F} durationInFrames={CLIP_F} layout="none">
          <OffthreadVideo src={staticFile("clip.mp4")} style={{ width: CLIP_W, height: CLIP_FULL_H }} />
        </Sequence>
        {t >= CS + CLIP_LEN && <Img src={staticFile("clip-last.jpg")} style={{ width: CLIP_W, height: CLIP_FULL_H }} />}
        <PlayButton t={t} frame={frame} />
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 14,
            background: "rgba(30,10,40,0.55)",
            color: "white",
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 22,
            padding: "5px 14px",
            borderRadius: 14,
            letterSpacing: 0.5,
          }}
        >
          ✦ AI video
        </div>
      </div>
      <SubBar t={t} frame={frame} />
    </div>
  );
};

const PlayButton: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t < 10.5 || t > 12.75) return null;
  const p = pop(frame, 10.6, 10, 180);
  const press = t > 12.15 ? Math.max(0.82, 1 - Math.sin(Math.min(1, (t - 12.15) / 0.2) * Math.PI) * 0.18) : 1;
  const pulse = 1 + Math.sin(t * 7) * 0.05;
  const out = lerp(t, 12.3, 12.55, 0, 1, easeIn);
  const ring = lerp(t, 12.15, 12.7, 0, 1, easeOut);
  const cx = CLIP_W / 2;
  const cy = TV.clipH / 2;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)", opacity: 1 - out }} />
      {t > 12.15 && (
        <div
          style={{
            position: "absolute",
            left: cx - 90,
            top: cy - 90,
            width: 180,
            height: 180,
            borderRadius: 90,
            border: "8px solid white",
            transform: `scale(${1 + ring * 1.8})`,
            opacity: 1 - ring,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: cx - 80,
          top: cy - 80,
          width: 160,
          height: 160,
          borderRadius: 80,
          background: "white",
          boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
          transform: `scale(${p * pulse * press * (1 - out)})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={70} height={76} viewBox="0 0 70 76">
          <path d="M14 6 L64 38 L14 70 Z" fill="#E63946" stroke="#E63946" strokeWidth={10} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

// ---------------- Tiêu đề phần clip ----------------
const ClipHeader: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t < 12.35) return null;
  const chip = pop(frame, 12.4, 13, 170);
  const title = pop(frame, 12.55, 10, 170);
  return (
    <div style={{ position: "absolute", left: 90, width: 880, top: 176, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "white",
          borderRadius: 30,
          padding: "6px 26px 6px 12px",
          boxShadow: "0 8px 18px rgba(80,0,0,0.3)",
          transform: `scale(${chip})`,
        }}
      >
        <Emoji name="book" size={46} />
        <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, color: "#B4122B", whiteSpace: "nowrap" }}>
          Tiếng Anh 8 · Unit 5 · Getting Started
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 10,
          transform: `scale(${0.5 + 0.5 * title}) rotate(${(1 - title) * -6}deg)`,
          opacity: Math.min(1, title * 2),
        }}
      >
        <Outline
          stroke="#7A0A1E"
          width={9}
          color="#FFD23F"
          style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 112, lineHeight: 1.1, whiteSpace: "nowrap" }}
          shadow="0 9px 0 rgba(70,0,15,0.5)"
        >
          Tet is coming!
        </Outline>
        <div style={{ transform: `rotate(${Math.sin(t * 3) * 10}deg)` }}>
          <Emoji name="envelope" size={104} style={{ filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.3))" }} />
        </div>
      </div>
    </div>
  );
};

// ---------------- Thẻ từ vựng ----------------
const CARD = { x: 70, y: 1112, w: 840, h: 262 };

const cardAt = (ct: number): [Card, number] => {
  let idx = 0;
  CARDS.forEach((c, i) => {
    if (ct >= c.at) idx = i;
  });
  return [CARDS[idx], idx];
};

const VocabCard: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const ct = t - CS;
  if (ct < CARDS[0].at) return null;
  const [card] = cardAt(ct);
  const p = pop(frame, CS + card.at, 11, 190, 0.7);
  const out = lerp(t, CS + CLIP_LEN - 0.4, CS + CLIP_LEN - 0.1, 0, 1, easeIn);
  const tag =
    card.kind === "intro" ? "LISTEN & READ" : card.kind === "guess" ? "GUESS!" : card.words.length > 1 ? "NEW WORDS" : "NEW WORD";
  const tagColor = card.kind === "guess" ? "#7C3AED" : card.kind === "intro" ? "#14A39B" : "#E63946";
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        transformOrigin: "50% 30%",
        transform: `scale(${(0.7 + 0.3 * p) * (1 - out * 0.3)}) rotate(${(1 - p) * 4}deg)`,
        opacity: Math.min(1, p * 2) * (1 - out),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "white",
          borderRadius: 34,
          border: "6px solid #FFD23F",
          boxShadow: "0 18px 40px rgba(70,0,10,0.4)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 30,
          top: -24,
          background: tagColor,
          color: "white",
          fontFamily: TITLE,
          fontWeight: 800,
          fontSize: 32,
          padding: "2px 22px 0",
          borderRadius: 22,
          border: "4px solid white",
          letterSpacing: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Emoji name={card.kind === "guess" ? "think" : "sparkles"} size={34} />
        {tag}
      </div>
      <CardBody card={card} t={t} frame={frame} />
    </div>
  );
};

const CardBody: React.FC<{ card: Card; t: number; frame: number }> = ({ card, t, frame }) => {
  const ct = t - CS;
  const wob = Math.sin(t * 3.2) * 6;
  if (card.kind === "intro") {
    return (
      <Row>
        <Emoji name="headphone" size={150} style={{ transform: `rotate(${wob}deg)` }} />
        <div>
          <div style={wordStyle(66)}>Listen and read</div>
          <div style={viStyle(36)}>Nghe hội thoại và đọc theo nhé!</div>
        </div>
      </Row>
    );
  }
  if (card.kind === "guess") {
    const n = GUESS_COUNT.filter((g) => ct >= g).length; // 0..3
    const num = n === 0 ? null : 4 - n;
    const np = n === 0 ? 0 : pop(frame, CS + GUESS_COUNT[n - 1], 8, 240, 0.6);
    return (
      <Row>
        <Emoji name="think" size={150} style={{ transform: `rotate(${wob * 1.5}deg)` }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...wordStyle(52), color: "#5B21B6" }}>What's that tall tree?</div>
          <div style={viStyle(36)}>Đoán xem: đó là cây gì?</div>
        </div>
        {num !== null && (
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              background: "#7C3AED",
              color: "white",
              fontFamily: TITLE,
              fontWeight: 800,
              fontSize: 76,
              lineHeight: "124px",
              textAlign: "center",
              transform: `scale(${np})`,
              flexShrink: 0,
            }}
          >
            {num}
          </div>
        )}
      </Row>
    );
  }
  const two = card.words.length > 1;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "6px 30px 0" }}>
      {card.words.map((w, i) => {
        const wp = pop(frame, CS + card.at + i * 0.25, 10, 200, 0.7);
        return (
          <div key={w.word} style={{ display: "flex", alignItems: "center", gap: 22, transform: `translateX(${(1 - wp) * 60}px)`, opacity: Math.min(1, wp * 2) }}>
            <Emoji name={w.emoji} size={two ? 96 : 156} style={{ transform: `rotate(${wob * (i ? -1 : 1)}deg)`, flexShrink: 0 }} />
            <div>
              <div style={wordStyle(two ? 54 : 74)}>{w.word}</div>
              <div style={viStyle(two ? 32 : 40)}>→ {w.vi}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 24, padding: "8px 34px 0 30px" }}>
    {children}
  </div>
);

const wordStyle = (size: number): React.CSSProperties => ({
  fontFamily: TITLE,
  fontWeight: 800,
  fontSize: size,
  lineHeight: 1.05,
  color: "#D3122E",
  whiteSpace: "nowrap",
});
const viStyle = (size: number): React.CSSProperties => ({
  fontFamily: BODY,
  fontWeight: 700,
  fontSize: size,
  lineHeight: 1.3,
  color: "#5A4A42",
  whiteSpace: "nowrap",
});

// ---------------- Pháo giấy khi lộ đáp án ----------------
const Confetti: React.FC<{ t: number; at: number; cx: number; cy: number; n?: number }> = ({ t, at, cx, cy, n = 30 }) => {
  const k = t - at;
  if (k < 0 || k > 1.4) return null;
  const colors = ["#FFD23F", "#FF5C9A", "#3DDC97", "#4CC9F0", "#FFFFFF", "#FF8C42"];
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const ang = random(`ca${i}`) * Math.PI * 2;
        const v = 500 + random(`cv${i}`) * 700;
        const x = cx + Math.cos(ang) * v * k;
        const y = cy + Math.sin(ang) * v * k * 0.8 + 900 * k * k;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 16,
              height: 26,
              borderRadius: 4,
              background: colors[i % colors.length],
              transform: `rotate(${k * 720 * (i % 2 ? 1 : -1) + i * 30}deg)`,
              opacity: lerp(k, 1.0, 1.4, 1, 0),
            }}
          />
        );
      })}
    </>
  );
};

// ---------------- Thanh tiến trình ----------------
const Progress: React.FC<{ t: number }> = ({ t }) => {
  if (t < CS) return null;
  const p = Math.min(1, (t - CS) / CLIP_LEN);
  const vis = life(t, CS, CS + CLIP_LEN, 0.3, 0.3);
  const left = 110;
  const w = 760;
  return (
    <div style={{ position: "absolute", left, top: 1424, width: w, height: 18, opacity: vis }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 9, background: "rgba(255,255,255,0.28)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: w * p, borderRadius: 9, background: "linear-gradient(90deg,#FFE066,#FFB020)" }} />
      <div style={{ position: "absolute", left: w * p - 28, top: -24 }}>
        <Emoji name="blossom" size={56} style={{ transform: `rotate(${t * 120}deg)` }} />
      </div>
    </div>
  );
};

export const ClipLayer: React.FC = () => {
  const frame = useCurrentFrame() - SHIFT_F;
  const t = frame / FPS;
  const flash = Math.max(life(t, 12.3, 12.62, 0.08, 0.24) * 0.85, 0);
  return (
    <>
      <TVFrame t={t} frame={frame} />
      <ClipHeader t={t} frame={frame} />
      <VocabCard t={t} frame={frame} />
      <Confetti t={t} at={CS + REVEAL_AT} cx={CARD.x + 160} cy={CARD.y + 120} />
      <Progress t={t} />
      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: "white", opacity: flash }} />}
    </>
  );
};

