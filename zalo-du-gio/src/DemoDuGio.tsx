import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/BeVietnamPro";

const { fontFamily: vnFont } = loadFont("normal", {
  weights: ["500", "600", "700", "800", "900"],
  subsets: ["latin", "vietnamese"],
});
const FONT = `${vnFont}, "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;

// =====================================================================
//  CẤU HÌNH – chỉnh chữ / mốc thời gian ở đây
// =====================================================================
export const DEMO_FPS = 30;
const CLIP1_FRAMES = 844; // demo1.mp4 (phần đầu tiết: khởi động -> từ vựng -> listen & read)
const CLIP2_FRAMES = 926; // demo2.mp4 (luyện tập -> trò chơi -> vận dụng)
const OUTRO_FRAMES = 75; // thẻ kết 2,5 giây (xoá được nếu không cần)
export const DEMO_DURATION = CLIP1_FRAMES + CLIP2_FRAMES + OUTRO_FRAMES;
const C1 = CLIP1_FRAMES / DEMO_FPS; // thời điểm clip 2 bắt đầu (giây)
const VIDEO_END = (CLIP1_FRAMES + CLIP2_FRAMES) / DEMO_FPS;

const STEPS = ["Khởi động", "Từ vựng", "Đọc hiểu", "Luyện tập", "Vận dụng"];
const STEP_COLORS = ["#ff6b6b", "#ffa726", "#26c6da", "#66bb6a", "#ab47bc"];

// Mỗi đoạn: thời điểm bắt đầu (giây), bước trong tiết dạy, tên hoạt động
const SEGMENTS: { at: number; step: number; tag: string; title: string }[] = [
  { at: 0, step: 0, tag: "KHỞI ĐỘNG", title: "Guess the landscape 🗺️" },
  { at: 8.8, step: 0, tag: "VÀO BÀI", title: "Unit 5: Natural Wonders 🏞️" },
  { at: 11.0, step: 1, tag: "TỪ VỰNG", title: "New words & Checking 📚" },
  { at: 18.5, step: 2, tag: "ĐỌC HIỂU", title: "Listen and read 🎧" },
  { at: C1, step: 3, tag: "LUYỆN TẬP", title: "Label the pictures 🖼️" },
  { at: C1 + 4.6, step: 3, tag: "TRÒ CHƠI", title: "Hidden Picture 🔍" },
  { at: C1 + 15.1, step: 4, tag: "VẬN DỤNG", title: "Quiz: Let's travel ✈️" },
];

// ---------------- layout 1080 x 1920 ----------------
const W = 1080;
const VID_H = Math.round((W * 1080) / 1728); // 675 – full chiều ngang, không cắt khung
const VID_TOP = 650;
const TAB_TOP = VID_TOP - 104;
const STEP_TOP = VID_TOP + VID_H + 50;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const prog = (t: number, a: number, d: number) => Math.max(0, Math.min(1, (t - a) / d));
const outCubic = Easing.bezier(0.33, 1, 0.68, 1);
const outBack = Easing.out(Easing.back(1.8));

// =====================================================================
export const DemoDuGio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const segIdx = SEGMENTS.reduce((acc, s, i) => (t >= s.at ? i : acc), 0);
  const seg = SEGMENTS[segIdx];
  const outro = t >= VIDEO_END;

  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: "linear-gradient(170deg,#0052d4 0%,#0068ff 40%,#00a3e0 100%)", overflow: "hidden" }}>
      <Background t={t} />
      <TopTitle t={t} />

      {/* ---------- VIDEO DEMO: full ngang, giữ nguyên khung ---------- */}
      <div
        style={{
          position: "absolute", left: 0, top: VID_TOP, width: W, height: VID_H, background: "#000",
          boxShadow: "0 18px 50px rgba(0,20,60,.55)",
          opacity: interpolate(t, [0, 0.35], [0, 1], clamp),
          scale: String(interpolate(t, [0, 0.6], [0.94, 1], { ...clamp, easing: outCubic })),
        }}
      >
        <Sequence from={0} durationInFrames={CLIP1_FRAMES} layout="none">
          <Video src={staticFile("demo1.mp4")} style={{ width: W, height: VID_H, objectFit: "contain", display: "block" }} />
        </Sequence>
        <Sequence from={CLIP1_FRAMES} durationInFrames={CLIP2_FRAMES} layout="none">
          <Video src={staticFile("demo2.mp4")} style={{ width: W, height: VID_H, objectFit: "contain", display: "block" }} />
        </Sequence>
        {outro && <OutroCover t={t} />}
        {/* thanh tiến độ tiết dạy */}
        <div style={{ position: "absolute", left: 0, bottom: -12, height: 12, width: W, background: "rgba(255,255,255,.25)" }}>
          <div style={{ height: 12, width: W * Math.min(1, t / VIDEO_END), background: "linear-gradient(90deg,#ffd600,#ff9100)" }} />
        </div>
        {/* chớp nhẹ khi chuyển clip */}
        <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(t, [C1, C1 + 0.25], [0.55, 0], clamp) * (t >= C1 ? 1 : 0) }} />
      </div>

      <StageTab t={t} seg={seg} segIdx={segIdx} outro={outro} />
      <Stepper t={t} active={outro ? STEPS.length : seg.step} />
      <BottomNote t={t} />

      {/* chớp trắng mở đầu – nối liền với video chat (kết thúc bằng màn trắng) */}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(t, [0, 0.45], [1, 0], { ...clamp, easing: Easing.out(Easing.quad) }) }} />

      <Sounds />
    </AbsoluteFill>
  );
};

// =====================================================================
const Background: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    {Array.from({ length: 14 }).map((_, i) => {
      const r = (k: number) => random(`bg-${i}-${k}`);
      const size = 60 + r(0) * 160;
      const x = r(1) * W;
      const y = ((r(2) * 2100 - t * (12 + r(3) * 25)) % 2100 + 2100) % 2100 - 120;
      return (
        <div key={i} style={{ position: "absolute", left: x - size / 2, top: y, width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,.07)", border: "2px solid rgba(255,255,255,.08)" }} />
      );
    })}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, background: "linear-gradient(180deg,rgba(0,40,120,0),rgba(0,30,90,.45))" }} />
  </AbsoluteFill>
);

const TopTitle: React.FC<{ t: number }> = ({ t }) => {
  const a = (d: number) => outBack(prog(t, 0.25 + d, 0.5));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", flexDirection: "column", alignItems: "center", color: "#fff" }}>
      <div style={{ display: "flex", gap: 16, scale: String(a(0)), opacity: prog(t, 0.25, 0.2) }}>
        <span style={{ background: "#ffd600", color: "#3a2a00", fontWeight: 900, fontSize: 36, padding: "10px 24px", borderRadius: 16, boxShadow: "0 4px 0 #c7a500" }}>🎬 DEMO DỰ GIỜ</span>
        <span style={{ background: "rgba(255,255,255,.18)", border: "2px solid rgba(255,255,255,.5)", fontWeight: 700, fontSize: 34, padding: "8px 22px", borderRadius: 16 }}>Global Success 6</span>
      </div>
      <div style={{ marginTop: 22, fontWeight: 900, fontSize: 92, lineHeight: 1, letterSpacing: 1, textShadow: "0 6px 0 rgba(0,40,120,.45)", scale: String(a(0.12)), opacity: prog(t, 0.37, 0.2) }}>
        UNIT 5
      </div>
      <div style={{ marginTop: 12, fontWeight: 800, fontSize: 50, color: "#ffe766", textShadow: "0 4px 0 rgba(0,40,120,.4)", scale: String(a(0.22)), opacity: prog(t, 0.47, 0.2) }}>
        NATURAL WONDERS OF VIET NAM
      </div>
    </div>
  );
};

const StageTab: React.FC<{ t: number; seg: (typeof SEGMENTS)[number]; segIdx: number; outro: boolean }> = ({ t, seg, segIdx, outro }) => {
  const since = t - seg.at;
  const ap = segIdx === 0 ? outBack(prog(t, 0.6, 0.5)) : outBack(prog(since, 0, 0.45));
  const color = STEP_COLORS[seg.step];
  if (outro) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: TAB_TOP, height: 84, display: "flex", alignItems: "center", gap: 18 }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 18, background: "#fff", borderRadius: 22, padding: "0 30px 0 12px", height: 84,
          boxShadow: `0 6px 0 ${color}`, transformOrigin: "0% 50%", scale: String(ap), opacity: Math.min(1, ap),
        }}
      >
        <span style={{ background: color, color: "#fff", fontWeight: 900, fontSize: 32, padding: "8px 18px", borderRadius: 14, whiteSpace: "nowrap" }}>
          {seg.step + 1} · {seg.tag}
        </span>
        <span style={{ fontWeight: 800, fontSize: 40, color: "#0b2350", whiteSpace: "nowrap" }}>{seg.title}</span>
      </div>
    </div>
  );
};

const Stepper: React.FC<{ t: number; active: number }> = ({ t, active }) => {
  const n = STEPS.length;
  const left = 110;
  const right = W - 110;
  const gap = (right - left) / (n - 1);
  const fill = Math.min(active, n - 1);
  const appear = outCubic(prog(t, 0.7, 0.5));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: STEP_TOP, height: 170, opacity: appear, translate: `0px ${(1 - appear) * 40}px` }}>
      <div style={{ position: "absolute", left, width: right - left, top: 40, height: 10, borderRadius: 5, background: "rgba(255,255,255,.3)" }} />
      <div style={{ position: "absolute", left, width: gap * fill, top: 40, height: 10, borderRadius: 5, background: "#ffd600" }} />
      {STEPS.map((s, i) => {
        const done = i < active;
        const cur = i === active;
        return (
          <div key={s} style={{ position: "absolute", left: left + gap * i - 90, width: 180, top: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 90, height: 90, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 40, scale: cur ? "1.15" : "0.9",
                background: done ? "#ffd600" : cur ? STEP_COLORS[i] : "rgba(255,255,255,.22)",
                color: done ? "#3a2a00" : "#fff", border: cur ? "6px solid #fff" : "4px solid rgba(255,255,255,.55)",
                boxShadow: cur ? `0 0 0 ${8 + 6 * Math.abs(Math.sin(t * 4))}px rgba(255,255,255,.25)` : "none",
              }}
            >
              {done ? "✓" : i + 1}
            </div>
            <div style={{ marginTop: 16, color: "#fff", fontSize: 32, fontWeight: cur ? 800 : 600, opacity: cur || done ? 1 : 0.7, whiteSpace: "nowrap" }}>{s}</div>
          </div>
        );
      })}
    </div>
  );
};

// thẻ kết: che video sau khi hết clip
const OutroCover: React.FC<{ t: number }> = ({ t }) => {
  const p = outBack(prog(t, VIDEO_END + 0.1, 0.5));
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#ffffff,#e6f0ff)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#0b2350" }}>
      <div style={{ fontSize: 110, scale: String(p) }}>🎉</div>
      <div style={{ fontWeight: 900, fontSize: 64, marginTop: 10, scale: String(p) }}>Tiết dạy đầy đủ 5 bước!</div>
      <div style={{ fontWeight: 700, fontSize: 40, marginTop: 18, color: "#0068ff", opacity: prog(t, VIDEO_END + 0.5, 0.3) }}>Follow để xem thêm bài soạn thao giảng 💙</div>
    </div>
  );
};

const BottomNote: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: STEP_TOP + 200, textAlign: "center", color: "rgba(255,255,255,.92)", fontWeight: 700, fontSize: 36, opacity: outCubic(prog(t, 1.0, 0.5)) }}>
    Bài 1: Getting Started · Geography Club 🌏
  </div>
);

// =====================================================================
const Sounds: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {SEGMENTS.slice(1).map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * fps)} layout="none">
          <Audio src={staticFile("sfx/pop.wav")} volume={0.18} />
        </Sequence>
      ))}
      <Sequence from={Math.round(C1 * fps) - 6} layout="none">
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.25} />
      </Sequence>
      <Sequence from={Math.round((VIDEO_END + 0.1) * fps)} layout="none">
        <Audio src={staticFile("sfx/ting.wav")} volume={0.35} />
      </Sequence>
    </>
  );
};
