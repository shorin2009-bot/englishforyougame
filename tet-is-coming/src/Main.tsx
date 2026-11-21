import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import "./fonts";
import { BODY, TITLE } from "./fonts";
import { ClipLayer } from "./ClipScene";
import { HookBackground, HookLayer } from "./Hook";
import { FPS, LEAD, OUTRO_AT, SFX, V } from "./timeline";
import { Emoji, FallingBlossoms, Lantern, Outline, TetBackground, easeIn, easeOut, lerp, pop } from "./ui";

// Rung màn hình: [thời điểm, độ dài, biên độ]
const SHAKES: [number, number, number][] = [
  [V(4.66), 0.35, 12],
  [V(5.79), 0.55, 24],
];

const shakeAt = (t: number) => {
  let x = 0;
  let y = 0;
  for (const [at, dur, amp] of SHAKES) {
    const k = (t - at) / dur;
    if (k >= 0 && k <= 1) {
      const a = amp * (1 - k);
      x += Math.sin(t * 95) * a;
      y += Math.cos(t * 83) * a * 0.7;
    }
  }
  return { x, y };
};

// nền đỏ Tết lan ra từ đầu đũa thần
const RED_FROM = { x: 990, y: 880 };

const Outro: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t < OUTRO_AT) return null;
  const r = lerp(t, OUTRO_AT, OUTRO_AT + 0.45, 0, 2300, easeOut);
  const badge = pop(frame, OUTRO_AT + 0.05, 10, 150);
  const l1 = pop(frame, OUTRO_AT + 0.22, 11, 180);
  const l2 = pop(frame, OUTRO_AT + 0.36, 9, 180);
  const chip = pop(frame, OUTRO_AT + 0.8, 12, 170);
  const bursts: [number, number, number, string][] = [
    [OUTRO_AT + 0.25, 150, 330, "fireworks"],
    [OUTRO_AT + 0.45, 760, 300, "confetti"],
    [OUTRO_AT + 0.7, 120, 1300, "party"],
    [OUTRO_AT + 0.9, 760, 1330, "fireworks"],
  ];
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at 540px 760px)` }}>
      <TetBackground t={t} />
      <FallingBlossoms t={t + 3} opacity={1} count={14} />
      {bursts.map(([at, x, y, name], i) => {
        const p = pop(frame, at, 8, 200, 0.6);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: `scale(${p}) rotate(${Math.sin(t * 4 + i) * 12}deg)` }}>
            <Emoji name={name} size={150} />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 540 - 175,
          top: 470,
          width: 350,
          height: 350,
          borderRadius: 175,
          background: "radial-gradient(circle,#FFFFFF 0%,#FFF3D1 100%)",
          border: "12px solid #FFD23F",
          boxShadow: "0 20px 50px rgba(60,0,10,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${badge})`,
        }}
      >
        <Emoji name="teacher" size={250} style={{ transform: `rotate(${Math.sin(t * 3) * 6}deg)` }} />
      </div>
      <div style={{ position: "absolute", left: 60, width: 960, top: 880, textAlign: "center" }}>
        <div style={{ transform: `scale(${l1})` }}>
          <Outline stroke="#7A0A1E" width={8} color="#FFFFFF" style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 92, lineHeight: 1.1 }}>
            Cô giáo tiếng Anh
          </Outline>
        </div>
        <div style={{ transform: `scale(${l2}) rotate(${(1 - l2) * 8}deg)`, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
          <Outline
            stroke="#7A0A1E"
            width={10}
            color="#FFD23F"
            style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 128, lineHeight: 1.1 }}
            shadow="0 10px 0 rgba(70,0,15,0.5)"
          >
            thích A.I
          </Outline>
          <Emoji name="sparkles" size={110} style={{ transform: `rotate(${t * 50}deg)` }} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 900,
          top: 1210,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${(1 - chip) * 80}px)`,
          opacity: Math.min(1, chip * 2),
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 40,
            padding: "14px 34px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 12px 28px rgba(60,0,10,0.45)",
          }}
        >
          <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 38, color: "#B4122B", whiteSpace: "nowrap" }}>
            Follow để xem thêm bài học vui!
          </span>
          <Emoji name="heart" size={56} style={{ transform: `scale(${1 + Math.sin(t * 8) * 0.08})` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const TetIsComing: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sh = shakeAt(t);
  const red = lerp(t, 8.95, 9.9, 0, 2300, easeIn);
  const lanternDrop = pop(frame, 9.7, 9, 110);
  return (
    <AbsoluteFill style={{ background: "#8A0B22", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        {t < 10 && <HookBackground t={t} />}
        {red > 0 && (
          <AbsoluteFill style={{ clipPath: `circle(${red}px at ${RED_FROM.x}px ${RED_FROM.y}px)` }}>
            <TetBackground t={t} />
          </AbsoluteFill>
        )}
        <FallingBlossoms t={t} opacity={lerp(t, 9.3, 10.2, 0, 1)} />
        {t > 9.6 && (
          <>
            <Lantern x={6} t={t} drop={lanternDrop} phase={0} len={150} size={118} />
            <Lantern x={956} t={t} drop={lanternDrop} phase={1.7} len={110} size={104} />
          </>
        )}
        <ClipLayer />
        <HookLayer />
        <Outro t={t} frame={frame} />
      </AbsoluteFill>

      {/* ---------- Âm thanh ---------- */}
      <Sequence from={Math.round(LEAD * FPS)} layout="none">
        <Audio src={staticFile("voice.wav")} volume={1} />
      </Sequence>
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * FPS)} layout="none">
          <Audio src={staticFile(`sfx/${s.src}.wav`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

