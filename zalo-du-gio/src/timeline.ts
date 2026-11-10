// =====================================================================
//  TIMELINE – chỉnh nội dung / thời điểm tin nhắn ở đây.
//  Các mốc thời gian (giây) được đo từ file voice.mp3 bằng silence-detect.
//  A(x) = thời điểm x giây trong file voice -> thời điểm trong video.
// =====================================================================

export const FPS = 30;
export const LEAD = 0.5; // khoảng đệm đầu video trước khi giọng nói bắt đầu
export const A = (sec: number) => sec + LEAD;
export const END = 24.0; // tổng thời lượng video (giây)

export const CONTACT_NAME = "Thảo 🌸 GV Anh";
export const CLOCK = "21:45";

export type ChatItem =
  | { k: "sep"; text: string; at: number }
  | {
      k: "in" | "out";
      text: string;
      tm: string;
      at: number;
      alarm?: boolean;
      type?: [number, number]; // khoảng thời gian "gõ phím" trong ô nhập (chỉ tin nhắn của mình)
      sfx?: Sfx;
    }
  | { k: "typing"; at: number; end: number }
  | { k: "img"; at: number; loadEnd: number; sfx?: Sfx }
  | { k: "video"; at: number; sfx?: Sfx };

export type Sfx = "in" | "out" | "alarm";

export const ITEMS: ChatItem[] = [
  // ---- lịch sử cũ (đã có sẵn khi video bắt đầu) ----
  { k: "sep", text: "16:30 Hôm qua", at: -9 },
  { k: "out", text: "Ngày đầu đi dạy thế nào em? 😊", tm: "16:30", at: -9 },
  { k: "in", text: "Dạ vui lắm chị ơi, học sinh dễ thương ghê 🥰", tm: "16:42", at: -9 },
  { k: "sep", text: "21:45 Hôm nay", at: -9 },

  // ---- hội thoại khớp với voice ----
  { k: "typing", at: A(-0.45), end: A(0.0) },
  { k: "in", text: "Chị ơi! Gấp, gấp! 🆘", tm: "21:45", at: A(0.0), sfx: "in" },
  { k: "typing", at: A(1.15), end: A(2.09) },
  { k: "in", text: "Em mới vào biên chế mà ban giám hiệu vừa báo…", tm: "21:45", at: A(2.09), sfx: "in" },
  { k: "in", text: "NGÀY MAI DỰ GIỜ!!! 😱", tm: "21:45", at: A(4.67), sfx: "alarm", alarm: true },
  { k: "typing", at: A(5.85), end: A(6.67) },
  { k: "in", text: "Em chưa chuẩn bị kịp gì hết, lo quá chị ơi! 😭", tm: "21:46", at: A(6.67), sfx: "in" },
  { k: "out", text: "Bình tĩnh! Em dạy bài nào?", tm: "21:46", at: A(10.64), type: [A(9.15), A(10.5)], sfx: "out" },
  { k: "typing", at: A(12.45), end: A(13.63) },
  { k: "in", text: "Global 6 – Unit 5, Getting Started 📖", tm: "21:46", at: A(13.63), sfx: "in" },
  { k: "img", at: A(14.45), loadEnd: A(15.15), sfx: "in" },
  { k: "out", text: "Hahaha! Đừng lo 😂", tm: "21:47", at: A(16.9), type: [A(15.75), A(16.8)], sfx: "out" },
  { k: "out", text: "Bài này chị soạn rồi 😎", tm: "21:47", at: A(18.8), type: [A(17.55), A(18.7)], sfx: "out" },
  { k: "out", text: "Xem demo nha! 👇", tm: "21:47", at: A(20.22), type: [A(19.35), A(20.12)], sfx: "out" },
  { k: "video", at: A(21.0), sfx: "out" },
];

export type BurstKind = "alarm" | "drop" | "rise" | "pop";
export const BURSTS: { at: number; kind: BurstKind; emojis: string[] }[] = [
  { at: A(4.67), kind: "alarm", emojis: ["😱", "⚠️", "😨", "‼️", "😱", "🚨", "😰", "⚠️", "😱", "🚨"] },
  { at: A(6.75), kind: "drop", emojis: ["😭", "💦", "😭", "💧", "😭", "💦"] },
  { at: A(16.9), kind: "rise", emojis: ["😂", "🤣", "😂", "😆", "😂", "🤣", "😂", "😆", "😂", "🤣", "😂", "😂"] },
  { at: A(18.85), kind: "pop", emojis: ["✨", "💪", "✨", "⭐"] },
];

export const SHAKE = { at: A(4.67), dur: 0.55 };
export const TAP = A(21.85); // bàn tay bấm nút play
export const ZOOM: [number, number] = [A(22.2), A(23.2)]; // zoom vào video demo
export const FLASH: [number, number] = [A(23.0), END]; // chớp trắng -> nối sang video demo
