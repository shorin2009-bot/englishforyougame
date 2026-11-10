import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/BeVietnamPro";
import {
  BURSTS,
  CLOCK,
  CONTACT_NAME,
  ChatItem,
  END,
  FLASH,
  ITEMS,
  LEAD,
  SHAKE,
  TAP,
  ZOOM,
} from "./timeline";

const { fontFamily: vnFont } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "vietnamese"],
});
const FONT = `${vnFont}, "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;

// ---------------- layout constants (1080 x 1920) ----------------
const W = 1080;
const H = 1920;
const STATUS_H = 64;
const HEADER_H = 160;
const CHAT_TOP = STATUS_H + HEADER_H;
const INPUT_H = 130;
const KB_H = 640;
const INPUT_TOP = H - KB_H - INPUT_H; // bàn phím luôn mở -> tin nhắn nằm trong vùng an toàn TikTok
const CHAT_PAD_BOTTOM = 26;

// vị trí thẻ video demo (tin cuối, căn đáy khung chat) – dùng cho zoom & bàn tay
const VCARD_W = 730;
const VCARD_H = 420;
const VCARD_CX = W - 24 - VCARD_W / 2;
const VCARD_CY = INPUT_TOP - CHAT_PAD_BOTTOM - VCARD_H / 2;
const PLAY_CX = W - 24 - 44 - 65;
const PLAY_CY = INPUT_TOP - CHAT_PAD_BOTTOM - 40 - 65;

const C = {
  blue1: "#0068ff",
  blue2: "#0190f3",
  chatbg: "#dfe6ee",
  outbub: "#e5efff",
  outborder: "#c6dcfb",
  txt: "#081c36",
  sub: "#7589a3",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const prog = (t: number, a: number, d: number) => Math.max(0, Math.min(1, (t - a) / d));
const outCubic = Easing.bezier(0.33, 1, 0.68, 1);
const outBack = Easing.out(Easing.back(1.7));
const inCubic = Easing.in(Easing.cubic);

// =====================================================================
export const ZaloChat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // ---- rung màn hình khi "NGÀY MAI DỰ GIỜ" ----
  const sp = prog(t, SHAKE.at, SHAKE.dur);
  const shaking = sp > 0 && sp < 1;
  const sx = shaking ? Math.sin((t - SHAKE.at) * 70) * 26 * (1 - sp) : 0;
  const sy = shaking ? Math.cos((t - SHAKE.at) * 55) * 14 * (1 - sp) : 0;

  // ---- zoom vào thẻ video ở cuối ----
  const zp = inCubic(prog(t, ZOOM[0], ZOOM[1] - ZOOM[0]));
  const zoomScale = 1 + zp * 1.6;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: FONT, color: C.txt }}>
      <AbsoluteFill
        style={{
          backgroundColor: C.chatbg,
          overflow: "hidden",
          transformOrigin: `${VCARD_CX}px ${VCARD_CY}px`,
          translate: `${sx + (W / 2 - VCARD_CX) * zp}px ${sy + (H / 2 - VCARD_CY) * zp}px`,
          scale: String(zoomScale),
          filter: zp > 0 ? `blur(${zp * 6}px)` : undefined,
        }}
      >
        <ChatArea t={t} />
        <StatusBar />
        <Header t={t} />
        <InputBar t={t} />
        <Keyboard t={t} />
        {/* viền đỏ cảnh báo */}
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, rgba(255,0,0,0) 45%, rgba(230,20,20,.6) 100%)",
            opacity: shaking ? 0.95 * (1 - sp) : t > SHAKE.at && t < SHAKE.at + 1.6 ? 0.3 * (1 - prog(t, SHAKE.at + SHAKE.dur, 1)) : 0,
          }}
        />
      </AbsoluteFill>

      <Particles t={t} />
      <Hand t={t} />

      {/* chớp trắng chuyển sang video demo */}
      <AbsoluteFill
        style={{
          backgroundColor: "#fff",
          opacity: interpolate(t, FLASH, [0, 1], { ...clamp, easing: Easing.in(Easing.quad) }),
        }}
      />

      <Sounds />
    </AbsoluteFill>
  );
};

// =====================================================================
//  STATUS BAR + HEADER
// =====================================================================
const StatusBar: React.FC = () => (
  <div
    style={{
      position: "absolute", left: 0, right: 0, top: 0, height: STATUS_H, background: C.blue1, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px",
      fontWeight: 600, fontSize: 32, zIndex: 5,
    }}
  >
    <span>{CLOCK}</span>
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <svg width="40" height="28" viewBox="0 0 40 28">
        <rect x="0" y="18" width="7" height="10" rx="2" fill="#fff" />
        <rect x="11" y="12" width="7" height="16" rx="2" fill="#fff" />
        <rect x="22" y="6" width="7" height="22" rx="2" fill="#fff" />
        <rect x="33" y="0" width="7" height="28" rx="2" fill="#fff" />
      </svg>
      <svg width="38" height="28" viewBox="0 0 38 28">
        <path d="M19 27l6-7a9 9 0 0 0-12 0z M6 13a19 19 0 0 1 26 0l-3.5 4a14 14 0 0 0-19 0z M0 7a27 27 0 0 1 38 0l-3.5 4a22 22 0 0 0-31 0z" fill="#fff" />
      </svg>
      <svg width="58" height="28" viewBox="0 0 58 28">
        <rect x="1.5" y="1.5" width="50" height="25" rx="7" fill="none" stroke="#fff" strokeWidth="3" />
        <rect x="6" y="6" width="34" height="16" rx="4" fill="#fff" />
        <rect x="54" y="9" width="4" height="10" rx="2" fill="#fff" />
      </svg>
    </div>
  </div>
);

const AVATAR_BG = "linear-gradient(135deg,#ff9a9e,#fecfef 60%,#a18cd1)";

const Header: React.FC<{ t: number }> = ({ t }) => {
  const typingNow = ITEMS.some((it) => it.k === "typing" && t >= it.at && t < it.end);
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: STATUS_H, height: HEADER_H, zIndex: 5,
        background: `linear-gradient(90deg,${C.blue1},${C.blue2})`, display: "flex", alignItems: "center",
        padding: "0 22px", color: "#fff", gap: 18, boxShadow: "0 2px 10px rgba(0,0,0,.12)",
      }}
    >
      <svg width="64" height="64" viewBox="0 0 24 24">
        <path d="M15.5 4.5L8 12l7.5 7.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div
        style={{
          width: 96, height: 96, borderRadius: "50%", flex: "none", position: "relative", background: AVATAR_BG,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, border: "3px solid rgba(255,255,255,.85)",
        }}
      >
        👩‍🏫
        <div style={{ position: "absolute", right: 0, bottom: 0, width: 26, height: 26, borderRadius: "50%", background: "#2ed157", border: "4px solid #fff" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15, whiteSpace: "nowrap" }}>{CONTACT_NAME}</div>
        <div style={{ fontSize: 30, opacity: 0.92, marginTop: 4 }}>
          {typingNow ? "đang soạn tin…" : "Vừa mới truy cập"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 34, paddingRight: 12 }}>
        <svg width="56" height="56" viewBox="0 0 24 24">
          <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <svg width="56" height="56" viewBox="0 0 24 24">
          <rect x="2.5" y="6" width="13" height="12" rx="2.5" fill="none" stroke="#fff" strokeWidth="1.8" />
          <path d="M15.5 10.5l6-3.5v10l-6-3.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <svg width="56" height="56" viewBox="0 0 24 24">
          <path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

// =====================================================================
//  CHAT AREA – tin nhắn xếp từ dưới lên, tin mới "đẩy" tin cũ lên trên
// =====================================================================
const sideOf = (it: ChatItem) => (it.k === "out" || it.k === "video" ? "out" : it.k === "sep" ? "sep" : "in");

// avatar hiện ở tin đầu tiên của mỗi cụm tin nhắn đến
const SHOW_AVATAR: boolean[] = (() => {
  let prev = "";
  return ITEMS.map((it) => {
    const s = sideOf(it);
    const show = s === "in" && prev !== "in" && it.k !== "img";
    if (it.k !== "typing") prev = s;
    return show;
  });
})();

const ChatArea: React.FC<{ t: number }> = ({ t }) => (
  <div
    style={{
      position: "absolute", left: 0, right: 0, top: CHAT_TOP, height: INPUT_TOP - CHAT_TOP, overflow: "hidden",
      display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: CHAT_PAD_BOTTOM,
    }}
  >
    {ITEMS.map((it, i) => (
      <ChatRow key={i} it={it} t={t} showAvatar={SHOW_AVATAR[i]} />
    ))}
  </div>
);

const ChatRow: React.FC<{ it: ChatItem; t: number; showAvatar: boolean }> = ({ it, t, showAvatar }) => {
  let g: number; // 0..1 chiều cao (đẩy các tin cũ lên)
  let s: number; // scale "nảy"
  let o: number;
  if (it.k === "typing") {
    if (t < it.at || t >= it.end + 0.2) return null;
    g = Math.min(outCubic(prog(t, it.at, 0.2)), 1 - outCubic(prog(t, it.end, 0.2)));
    s = 0.7 + 0.3 * g;
    o = g;
  } else {
    if (t < it.at) return null;
    g = outCubic(prog(t, it.at, 0.28));
    s = 0.55 + 0.45 * outBack(prog(t, it.at, 0.36));
    o = prog(t, it.at, 0.12);
  }
  const side = sideOf(it);
  const origin = side === "out" ? "100% 100%" : "0% 100%";

  let body: React.ReactNode = null;
  if (it.k === "sep") {
    body = (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span style={{ background: "rgba(60,75,95,.42)", color: "#fff", fontSize: 28, fontWeight: 500, padding: "10px 26px", borderRadius: 30 }}>
          {it.text}
        </span>
      </div>
    );
  } else {
    let bub: React.ReactNode = null;
    if (it.k === "typing") bub = <TypingDots t={t} />;
    else if (it.k === "in" || it.k === "out") bub = <TextBubble text={it.text} tm={it.tm} side={side} alarm={"alarm" in it && !!it.alarm} />;
    else if (it.k === "img") bub = <ImageMsg t={t} at={it.at} loadEnd={it.loadEnd} />;
    else if (it.k === "video") bub = <VideoCard t={t} at={it.at} />;
    body = (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, justifyContent: side === "out" ? "flex-end" : "flex-start" }}>
        {side === "in" && <MiniAvatar visible={showAvatar} />}
        <div style={{ transformOrigin: origin, scale: String(s) }}>{bub}</div>
      </div>
    );
  }

  return (
    // grid 0fr -> 1fr: tin mới mọc chiều cao mượt, đẩy tin cũ lên
    <div style={{ display: "grid", gridTemplateRows: `${g}fr`, opacity: o, flex: "none" }}>
      <div style={{ minHeight: 0, alignSelf: "end", padding: "9px 24px" }}>{body}</div>
    </div>
  );
};

const MiniAvatar: React.FC<{ visible: boolean }> = ({ visible }) => (
  <div
    style={{
      width: 76, height: 76, borderRadius: "50%", flex: "none", background: AVATAR_BG, alignSelf: "flex-start",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, visibility: visible ? "visible" : "hidden",
    }}
  >
    👩‍🏫
  </div>
);

const TextBubble: React.FC<{ text: string; tm: string; side: string; alarm: boolean }> = ({ text, tm, side, alarm }) => (
  <div
    style={{
      maxWidth: alarm ? 900 : 790, padding: "22px 30px 18px", borderRadius: 26, lineHeight: 1.36,
      fontSize: alarm ? 58 : 46, fontWeight: alarm ? 900 : 500, letterSpacing: alarm ? 1 : 0,
      color: alarm ? "#e1261c" : C.txt,
      background: alarm ? "#fff4f2" : side === "out" ? C.outbub : "#fff",
      border: alarm ? "3px solid #ff8a80" : `1px solid ${side === "out" ? C.outborder : "#d8dee6"}`,
      boxShadow: "0 1px 2px rgba(0,0,0,.08)",
    }}
  >
    {text}
    <div style={{ fontSize: 26, color: C.sub, marginTop: 6, fontWeight: 400, letterSpacing: 0 }}>{tm}</div>
  </div>
);

const TypingDots: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ background: "#fff", border: "1px solid #d8dee6", borderRadius: 26, padding: "30px 34px", display: "flex", gap: 14 }}>
    {[0, 1, 2].map((j) => {
      const ph = (((t * 2.6 - j * 0.18) % 1) + 1) % 1;
      const up = ph < 0.4 ? Math.sin((ph / 0.4) * Math.PI) : 0;
      return <div key={j} style={{ width: 18, height: 18, borderRadius: "50%", background: "#8aa0b8", translate: `0px ${-14 * up}px`, opacity: 0.5 + 0.5 * up }} />;
    })}
  </div>
);

// ảnh SGK được "gửi" vào khung chat: mờ + vòng tải -> rõ nét
const IMG_W = 860;
const IMG_H = Math.round((IMG_W * 1214) / 1738);
const ImageMsg: React.FC<{ t: number; at: number; loadEnd: number }> = ({ t, at, loadEnd }) => {
  const lp = outCubic(prog(t, at, loadEnd - at));
  const done = prog(t, loadEnd, 0.3);
  return (
    <div style={{ width: IMG_W, height: IMG_H, borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: "0 2px 6px rgba(0,0,0,.18)", background: "#cfd8e3" }}>
      <Img
        src={staticFile("sgk-unit5.jpg")}
        style={{ width: IMG_W, height: IMG_H, display: "block", filter: `blur(${18 * (1 - done)}px) brightness(${0.85 + 0.15 * done})`, scale: String(1 + 0.06 * (1 - done)) }}
      />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - done }}>
        <svg width="130" height="130" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="rgba(0,0,0,.35)" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="8" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${214 * lp} 214`} transform="rotate(-90 50 50)" />
        </svg>
      </div>
    </div>
  );
};

// thẻ video demo (tin nhắn cuối) – dẫn sang video demo phía sau
const VideoCard: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const pulse = t > at + 0.4 ? ((t - at - 0.4) % 0.9) / 0.9 : 0;
  const tp = prog(t, TAP, 0.25);
  const press = tp > 0 && tp < 1 ? Math.sin(tp * Math.PI) : 0;
  return (
    <div style={{ width: VCARD_W, height: VCARD_H, borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,.2)" }}>
      <Img src={staticFile("sgk-unit5.jpg")} style={{ position: "absolute", inset: -10, width: VCARD_W + 20, height: VCARD_H + 20, objectFit: "cover", objectPosition: "center 30%", filter: "blur(2px) saturate(1.2)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,rgba(0,40,90,.85),rgba(0,104,255,.55) 55%,rgba(255,120,40,.6))" }} />
      <div style={{ position: "absolute", left: 26, top: 24, background: "#ffd600", color: "#3a2a00", fontWeight: 900, fontSize: 30, padding: "8px 18px", borderRadius: 12 }}>🎬 DEMO DỰ GIỜ</div>
      <div style={{ position: "absolute", right: 22, top: 22, background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 26, fontWeight: 700, padding: "6px 14px", borderRadius: 10 }}>HD</div>
      <div style={{ position: "absolute", left: 28, right: 28, top: 98, color: "#fff", fontWeight: 900, fontSize: 60, lineHeight: 1.08, textShadow: "0 3px 10px rgba(0,0,0,.35)" }}>
        UNIT 5<br />GETTING STARTED
      </div>
      <div style={{ position: "absolute", left: 28, bottom: 26, color: "#fff", fontWeight: 600, fontSize: 30 }}>Global Success 6 · Natural Wonders</div>
      <div style={{ position: "absolute", right: 44, bottom: 40, width: 130, height: 130, borderRadius: "50%", border: "6px solid #fff", opacity: t > at + 0.4 ? 1 - pulse : 0, scale: String(1 + pulse * 0.6) }} />
      <div
        style={{
          position: "absolute", right: 44, bottom: 40, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,.95)",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(0,0,0,.35)", scale: String(1 - 0.12 * press),
        }}
      >
        <div style={{ marginLeft: 12, width: 0, height: 0, borderLeft: `46px solid ${C.blue1}`, borderTop: "30px solid transparent", borderBottom: "30px solid transparent" }} />
      </div>
    </div>
  );
};

// =====================================================================
//  INPUT BAR + KEYBOARD (mô phỏng "chị" đang gõ trả lời)
// =====================================================================
const currentTyping = (t: number) => {
  for (const it of ITEMS) {
    if ((it.k === "out" || it.k === "in") && it.type && t >= it.type[0] && t < it.at) return it;
  }
  return null;
};
const typingState = (t: number) => {
  const it = currentTyping(t);
  if (!it || !("type" in it) || !it.type) return null;
  const chars = [...it.text];
  const n = chars.length;
  const p = prog(t, it.type[0], it.type[1] - it.type[0]);
  const cnt = Math.min(n, Math.floor(p * n) + (p > 0 ? 1 : 0));
  return { shown: chars.slice(0, cnt).join(""), last: p < 1 && cnt > 0 ? chars[cnt - 1] : null, done: p >= 1 };
};

const InputBar: React.FC<{ t: number }> = ({ t }) => {
  const ts = typingState(t);
  const blink = Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: INPUT_TOP, height: INPUT_H, background: "#fff", borderTop: "1px solid #dde3ea", display: "flex", alignItems: "center", padding: "0 26px", gap: 20, zIndex: 4 }}>
      <svg width="60" height="60" viewBox="0 0 24 24" style={{ flex: "none" }}>
        <circle cx="12" cy="12" r="9.2" fill="none" stroke={C.sub} strokeWidth="1.7" />
        <circle cx="9" cy="10" r="1.2" fill={C.sub} />
        <circle cx="15" cy="10" r="1.2" fill={C.sub} />
        <path d="M8 14.2c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4" fill="none" stroke={C.sub} strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      <div style={{ flex: 1, fontSize: 42, whiteSpace: "nowrap", overflow: "hidden", display: "flex", alignItems: "center", minWidth: 0 }}>
        {ts ? (
          <>
            <span>{ts.shown}</span>
            <span style={{ width: 4, height: 52, background: C.blue1, marginLeft: 2 }} />
          </>
        ) : (
          <>
            <span style={{ width: 4, height: 52, background: C.blue1, marginRight: 4, opacity: blink ? 1 : 0 }} />
            <span style={{ color: "#8b9bb0" }}>Tin nhắn</span>
          </>
        )}
      </div>
      {ts ? (
        <svg width="66" height="66" viewBox="0 0 24 24" style={{ scale: ts.done ? "0.85" : "1" }}>
          <path d="M3 20.5l18-8.5L3 3.5l2.5 7L14 12l-8.5 1.5z" fill={C.blue1} />
        </svg>
      ) : (
        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <svg width="60" height="60" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.8" fill={C.sub} /><circle cx="12" cy="12" r="1.8" fill={C.sub} /><circle cx="19" cy="12" r="1.8" fill={C.sub} /></svg>
          <svg width="60" height="60" viewBox="0 0 24 24"><rect x="8.5" y="3" width="7" height="12" rx="3.5" fill="none" stroke={C.sub} strokeWidth="1.7" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke={C.sub} strokeWidth="1.7" strokeLinecap="round" /></svg>
          <svg width="60" height="60" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="15" rx="2.5" fill="none" stroke={C.sub} strokeWidth="1.7" /><circle cx="8.5" cy="9.5" r="1.7" fill={C.sub} /><path d="M3.5 17l5-5 4 4 3-3 5 5" fill="none" stroke={C.sub} strokeWidth="1.7" strokeLinejoin="round" /></svg>
        </div>
      )}
    </div>
  );
};

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
  ["?123", ",", "😊", " ", ".", "➤"],
];
const ALL_KEYS = new Set(ROWS.flat());
const keyFor = (ch: string) => {
  if (ch === " ") return " ";
  const b = ch.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  if (ALL_KEYS.has(b)) return b;
  if (b === "!" || b === "?") return "?123";
  return "😊";
};

const Keyboard: React.FC<{ t: number }> = ({ t }) => {
  const ts = typingState(t);
  const down = ts ? (ts.done ? "➤" : ts.last ? keyFor(ts.last) : null) : null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: H - KB_H, height: KB_H, background: "#e3e6ea", zIndex: 4, padding: "0 8px" }}>
      <div style={{ height: 84, display: "flex", alignItems: "center", color: "#3c4a5c", fontSize: 36, fontWeight: 500, borderBottom: "1px solid #d0d4da" }}>
        {["Bình tĩnh", "Ok em", "😊"].map((s, i) => (
          <span key={s} style={{ flex: 1, textAlign: "center", borderLeft: i ? "2px solid #c9ced6" : undefined }}>{s}</span>
        ))}
      </div>
      {ROWS.map((r, ri) => (
        <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }}>
          {r.map((c) => {
            const fn = c === "⇧" || c === "⌫" || c === "?123";
            const isDown = down === c;
            const isLetter = c.length === 1 && /[a-z,.]/.test(c);
            return (
              <div
                key={c}
                style={{
                  position: "relative", height: 114, width: c === " " ? 470 : fn || c === "➤" ? 150 : 96,
                  background: c === "➤" ? C.blue1 : isDown ? "#b9c0ca" : fn ? "#c9ced6" : "#fff",
                  color: c === "➤" ? "#fff" : c === " " ? "#6b7686" : "#1c2633",
                  borderRadius: 14, boxShadow: "0 3px 0 #b3b8c0", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: c === " " ? 30 : fn ? 36 : 48, fontWeight: fn ? 600 : 400, scale: isDown && c === "➤" ? "0.92" : "1",
                }}
              >
                {c === " " ? "Tiếng Việt" : c}
                {isDown && isLetter && (
                  <div style={{ position: "absolute", bottom: 96, left: -12, width: 120, height: 140, background: "#fff", borderRadius: 16, boxShadow: "0 6px 18px rgba(0,0,0,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, fontWeight: 500, color: "#1c2633" }}>
                    {c}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// =====================================================================
//  EMOJI BAY + BÀN TAY BẤM PLAY
// =====================================================================
const Particles: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {BURSTS.flatMap((b, bi) =>
      b.emojis.map((e, i) => {
        const r = [0, 1, 2, 3, 4].map((k) => random(`b${bi}-${i}-${k}`));
        const life = b.kind === "rise" ? 1.9 : 1.5;
        const lt = (t - b.at - i * 0.04) / life;
        if (lt < 0 || lt > 1) return null;
        let x: number, y: number, sz: number, rot: number, op: number;
        if (b.kind === "alarm") {
          const ang = (i / b.emojis.length) * Math.PI * 2 + r[0] * 0.6;
          const dist = 180 + r[1] * 360;
          const e2 = outCubic(Math.min(1, lt * 1.6));
          x = 540 + Math.cos(ang) * dist * e2;
          y = 640 + Math.sin(ang) * dist * e2 * 1.1 + lt * lt * 200;
          sz = (90 + r[2] * 70) * (0.3 + 0.7 * outBack(Math.min(1, lt * 3)));
          rot = (r[3] - 0.5) * 60 * lt;
          op = lt < 0.7 ? 1 : 1 - (lt - 0.7) / 0.3;
        } else if (b.kind === "rise") {
          x = (i % 2 === 0 ? 30 + r[0] * 200 : 850 + r[0] * 200) + Math.sin(lt * 6 + r[1] * 6) * 40;
          y = 1150 - lt * (850 + r[2] * 350);
          sz = 80 + r[3] * 70;
          rot = Math.sin(lt * 5 + r[4] * 3) * 20;
          op = lt < 0.15 ? lt / 0.15 : lt > 0.75 ? 1 - (lt - 0.75) / 0.25 : 1;
        } else if (b.kind === "drop") {
          x = 140 + r[0] * 800;
          y = 300 + lt * (600 + r[1] * 200) + r[2] * 80;
          sz = 70 + r[3] * 50;
          rot = (r[4] - 0.5) * 30;
          op = lt < 0.1 ? lt / 0.1 : lt > 0.7 ? 1 - (lt - 0.7) / 0.3 : 1;
        } else {
          const ang = -Math.PI / 2 + (r[0] - 0.5) * 2.2;
          const e2 = outCubic(lt);
          x = 760 + Math.cos(ang) * 260 * e2;
          y = 820 + Math.sin(ang) * 240 * e2;
          sz = 60 + r[1] * 40;
          rot = 0;
          op = 1 - lt;
        }
        return (
          <div key={`${bi}-${i}`} style={{ position: "absolute", left: 0, top: 0, lineHeight: 1, fontSize: sz, opacity: op, translate: `${x - sz / 2}px ${y - sz / 2}px`, rotate: `${rot}deg` }}>
            {e}
          </div>
        );
      }),
    )}
  </AbsoluteFill>
);

const Hand: React.FC<{ t: number }> = ({ t }) => {
  if (t < TAP - 0.55 || t > ZOOM[0] + 0.2) return null;
  const ap = outCubic(prog(t, TAP - 0.55, 0.45));
  const tp = prog(t, TAP, 0.25);
  const press = tp > 0 && tp < 1 ? Math.sin(tp * Math.PI) : 0;
  return (
    <div
      style={{
        position: "absolute", left: 0, top: 0, fontSize: 130, lineHeight: 1,
        opacity: Math.min(ap, 1 - prog(t, ZOOM[0], 0.15)),
        translate: `${PLAY_CX - 45 + (1 - ap) * 220}px ${PLAY_CY - 10 + (1 - ap) * 260}px`,
        scale: String(1 - 0.15 * press),
      }}
    >
      👆
    </div>
  );
};

// =====================================================================
//  ÂM THANH: voice + hiệu ứng (ting / pop / gõ phím / boom / whoosh)
// =====================================================================
const Sfx: React.FC<{ at: number; src: string; volume: number }> = ({ at, src, volume }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} layout="none">
      <Audio src={staticFile(`sfx/${src}`)} volume={volume} />
    </Sequence>
  );
};

const Sounds: React.FC = () => {
  const { fps } = useVideoConfig();
  const ev: { at: number; src: string; volume: number }[] = [];
  for (const it of ITEMS) {
    if (it.k === "typing" || it.k === "sep" || it.at <= 0) continue;
    if (it.sfx === "in") ev.push({ at: it.at, src: "ting.wav", volume: 0.32 });
    if (it.sfx === "out") ev.push({ at: it.at, src: "pop.wav", volume: 0.35 });
    if (it.sfx === "alarm") {
      ev.push({ at: it.at, src: "boom.wav", volume: 0.55 });
      ev.push({ at: it.at, src: "ting.wav", volume: 0.3 });
    }
    if ((it.k === "out" || it.k === "in") && it.type) {
      const n = [...it.text].length;
      for (let i = 0; i < n; i += 1) ev.push({ at: it.type[0] + ((it.type[1] - it.type[0]) * i) / n, src: "key.wav", volume: 0.12 });
    }
  }
  ev.push({ at: TAP, src: "tap.wav", volume: 0.4 });
  ev.push({ at: ZOOM[0], src: "whoosh.wav", volume: 0.45 });
  return (
    <>
      <Sequence from={Math.round(LEAD * fps)} durationInFrames={Math.round((END - LEAD) * fps)} layout="none">
        <Audio src={staticFile("voice.mp3")} volume={1} />
      </Sequence>
      {ev.map((e, i) => (
        <Sfx key={i} {...e} />
      ))}
    </>
  );
};
