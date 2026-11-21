// =====================================================================
//  TIMELINE – mọi mốc thời gian (giây) của video nằm ở đây.
//  Mốc giọng đọc đo bằng silencedetect trên file voice.
// =====================================================================

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const LEAD = 0.3; // đệm đầu video trước khi giọng đọc bắt đầu
export const V = (s: number) => s + LEAD; // thời điểm trong voice -> thời điểm trong video

// Các câu trong voice (giây, tính trong file voice)
//  0.00–2.37  "Các thầy cô vẫn cho học sinh đọc hội thoại trong sách…"
//  2.73–3.64  "…như thế này sao?"
//  4.69–5.54  "Đừng nha!"
//  5.79–6.51  "Chán lắm!"
//  7.30–10.39 "Hãy biến nó thành video sinh động để các em hứng thú hơn nhé!"
// 11.05–12.04 "Hahaha!"

export const CLIP_START_F = 374; // clip bắt đầu ở giây 12.47
export const CLIP_F = 651; // clip dài 21.7 giây, giữ nguyên
export const OUTRO_F = 90; // màn kết 3 giây
export const TOTAL_F = CLIP_START_F + CLIP_F + OUTRO_F;
// Đoạn mở đầu bìa sách + lật trang chèn thêm 0.6 giây trước toàn bộ timeline.
// Mọi mốc trong file này tính theo "thời gian cũ"; thời gian thật = cũ + SHIFT.
export const SHIFT_F = 18;
export const SHIFT = SHIFT_F / FPS;
export const TOTAL_ALL = TOTAL_F + SHIFT_F;
export const CS = CLIP_START_F / FPS;
export const CLIP_LEN = CLIP_F / FPS;
export const OUTRO_AT = CS + CLIP_LEN - 0.15;

// ---------------- Phụ đề clip (thời gian tính trong clip) ----------------
export type Part = string | { hl: string };
export type Sub = { at: number; who: "Elena" | "Trang"; parts: Part[] };

export const SUBS: Sub[] = [
  { at: 0, who: "Elena", parts: ["Wow, this girl looks so cute."] },
  { at: 2.45, who: "Trang", parts: ["She's my cousin. She's at ", { hl: "Sa Dec Flower Village" }, "."] },
  { at: 6.25, who: "Elena", parts: ["Oh, I'm fond of ", { hl: "admiring" }, " the flowers."] },
  { at: 9.05, who: "Trang", parts: ["They are an important part of our Tet ", { hl: "tradition" }, "."] },
  { at: 10.4, who: "Elena", parts: ["And what's that tall tree in the photo?"] },
  { at: 14.4, who: "Trang", parts: ["Well, it's actually a ", { hl: "bamboo pole" }, "."] },
  { at: 16.25, who: "Trang", parts: ["People place it in the yard of the ", { hl: "communal house" }, "."] },
  {
    at: 18.95,
    who: "Trang",
    parts: ["They hang decorative items like ", { hl: "small bells" }, " and ", { hl: "lanterns" }, " on it."],
  },
];

// ---------------- Thẻ từ vựng (thời gian tính trong clip) ----------------
export type Word = { emoji: string; word: string; vi: string };
export type Card =
  | { at: number; kind: "intro" }
  | { at: number; kind: "word"; words: Word[] }
  | { at: number; kind: "guess" };

export const CARDS: Card[] = [
  { at: -1.85, kind: "intro" },
  { at: 2.45, kind: "word", words: [{ emoji: "blossom", word: "flower village", vi: "làng hoa" }] },
  { at: 6.25, kind: "word", words: [{ emoji: "hearteyes", word: "admire", vi: "ngắm nhìn, chiêm ngưỡng" }] },
  { at: 9.05, kind: "word", words: [{ emoji: "envelope", word: "tradition", vi: "truyền thống" }] },
  { at: 10.4, kind: "guess" },
  { at: 14.4, kind: "word", words: [{ emoji: "bamboo", word: "bamboo pole", vi: "cây nêu" }] },
  { at: 16.25, kind: "word", words: [{ emoji: "castle", word: "communal house", vi: "đình làng" }] },
  {
    at: 18.95,
    kind: "word",
    words: [
      { emoji: "bell", word: "small bells", vi: "chuông nhỏ" },
      { emoji: "lantern", word: "lanterns", vi: "đèn lồng" },
    ],
  },
];
export const GUESS_COUNT = [12.9, 13.4, 13.9]; // đếm ngược 3-2-1 trước khi lộ đáp án
export const REVEAL_AT = 14.4;

// ---------------- Hiệu ứng âm thanh (thời gian trong video) ----------------
export const SFX: { at: number; src: string; vol: number }[] = [
  // bìa sách rơi xuống, mở bìa, lật trang
  { at: -0.33, src: "impact", vol: 0.5 },
  { at: -0.2, src: "coverflip", vol: 0.55 },
  ...[0.52, 0.84, 1.05, 1.25, 1.43, 1.6, 1.76].map((at, i) => ({
    at,
    src: `flip${(i % 3) + 1}`,
    vol: 0.42 + (i % 2) * 0.08,
  })),
  { at: 2.15, src: "zoom", vol: 0.3 },
  { at: 3.0, src: "tick", vol: 0.45 },
  { at: V(4.65), src: "pop", vol: 0.55 },
  { at: V(5.79), src: "boom", vol: 0.75 },
  { at: 7.62, src: "magic", vol: 0.42 },
  { at: 8.6, src: "ting", vol: 0.35 },
  { at: 9.55, src: "pop", vol: 0.35 },
  { at: 9.75, src: "pop", vol: 0.35 },
  { at: 10.15, src: "zoomdown", vol: 0.32 },
  { at: 10.35, src: "blip", vol: 0.45 },
  { at: V(11.05), src: "pops", vol: 0.5 },
  { at: 12.15, src: "tap", vol: 0.55 },
  { at: 12.28, src: "zoom", vol: 0.28 },
  // trong clip: âm thật nhẹ để không át lời thoại
  ...[2.45, 6.25, 9.05, 10.4, 16.25, 18.95].map((t) => ({ at: CS + t, src: "blip", vol: 0.16 })),
  ...GUESS_COUNT.map((t) => ({ at: CS + t, src: "tap", vol: 0.22 })),
  { at: CS + REVEAL_AT, src: "reveal", vol: 0.28 },
  { at: OUTRO_AT + 0.05, src: "ting", vol: 0.45 },
  { at: OUTRO_AT + 0.3, src: "pops", vol: 0.35 },
];
