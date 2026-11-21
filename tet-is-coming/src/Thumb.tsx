import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "./fonts";
import { BODY, TITLE } from "./fonts";
import { Emoji, FallingBlossoms, Outline, Star4, TetBackground } from "./ui";

// Ảnh bìa TikTok 1080×1920: SGK Tiếng Anh 8 (đọc chay, chán) -> video hoạt hình sinh động
export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <TetBackground t={1.2} />
    <FallingBlossoms t={5.3} opacity={0.9} count={14} />

    {/* Tiêu đề */}
    <div style={{ position: "absolute", left: 40, width: 1000, top: 150, textAlign: "center", whiteSpace: "nowrap" }}>
      <Outline stroke="#7A0A1E" width={8} color="#FFFFFF" style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 84, lineHeight: 1.1 }}>
        Đừng đọc chay nữa!
      </Outline>
      <div>
        <Outline
          stroke="#7A0A1E"
          width={9}
          color="#FFD23F"
          style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 108, lineHeight: 1.08 }}
          shadow="0 9px 0 rgba(70,0,15,0.5)"
        >
          Biến SGK thành
        </Outline>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
        <Outline
          stroke="#7A0A1E"
          width={10}
          color="#FFD23F"
          style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 132, lineHeight: 1.05 }}
          shadow="0 10px 0 rgba(70,0,15,0.5)"
        >
          VIDEO
        </Outline>
        <Emoji name="sparkles" size={110} />
      </div>
    </div>

    {/* Bìa sách Tiếng Anh 8 */}
    <div style={{ position: "absolute", left: 56, top: 590, transform: "rotate(-9deg)" }}>
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          width: 330,
          height: 460,
          borderRadius: "4px 16px 16px 4px",
          background: "repeating-linear-gradient(90deg,#F4EFE4 0 3px,#E2D9C6 3px 5px)",
          boxShadow: "0 24px 44px rgba(40,0,10,0.5)",
        }}
      />
      <div style={{ position: "relative", width: 330, height: 460, borderRadius: "4px 16px 16px 4px", overflow: "hidden" }}>
        <Img src={staticFile("cover.jpg")} style={{ width: 330, height: 460, display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 7%)" }} />
      </div>
    </div>

    {/* Trang hội thoại xám + dấu BORING */}
    <div
      style={{
        position: "absolute",
        left: 330,
        top: 650,
        width: 600,
        height: 410,
        borderRadius: 26,
        overflow: "hidden",
        border: "8px solid white",
        boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
        transform: "rotate(5deg)",
      }}
    >
      <Img
        src={staticFile("book.jpg")}
        style={{
          position: "absolute",
          width: 1732 * 1.25,
          left: -60 * 1.25,
          top: -560 * 1.25,
          filter: "grayscale(1) contrast(0.9)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 130,
          transform: "rotate(-12deg)",
          border: "10px solid #E11D48",
          borderRadius: 24,
          padding: "0 26px",
          fontFamily: TITLE,
          fontWeight: 800,
          fontSize: 100,
          color: "#E11D48",
          background: "rgba(255,255,255,0.75)",
        }}
      >
        BORING!
      </div>
    </div>
    <div style={{ position: "absolute", left: 830, top: 575, transform: "rotate(10deg)" }}>
      <Emoji name="yawn" size={180} />
    </div>

    {/* Mũi tên + đũa thần */}
    <div style={{ position: "absolute", left: 380, top: 1065, transform: "rotate(10deg)" }}>
      <svg width={260} height={190} viewBox="0 0 260 200">
        <path d="M20 30 C 120 10, 210 60, 200 150" fill="none" stroke="#FFD23F" strokeWidth={20} strokeLinecap="round" />
        <path d="M160 130 L 202 178 L 238 122" fill="none" stroke="#FFD23F" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <div style={{ position: "absolute", left: 150, top: 1075 }}>
      <Emoji name="wand" size={160} />
    </div>
    {[
      [110, 1080, 56],
      [330, 1170, 42],
      [660, 1100, 50],
    ].map(([x, y, s], i) => (
      <div key={i} style={{ position: "absolute", left: x, top: y }}>
        <Star4 size={s} color="#FFFFFF" />
      </div>
    ))}

    {/* Khung video sinh động */}
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 1245,
        width: 820,
        height: 380,
        borderRadius: 34,
        padding: 10,
        background: "linear-gradient(135deg,#FFE08A,#F59E0B)",
        boxShadow: "0 24px 50px rgba(60,0,10,0.5)",
        transform: "rotate(3deg)",
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 26, overflow: "hidden" }}>
        <Img src={staticFile("clip-thumb.jpg")} style={{ width: 800, height: 450, marginTop: -10 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: -30,
          top: -34,
          background: "#14A39B",
          color: "white",
          fontFamily: TITLE,
          fontWeight: 800,
          fontSize: 44,
          padding: "2px 26px 0",
          borderRadius: 26,
          border: "5px solid white",
        }}
      >
        Tet is coming!
      </div>
    </div>
    <div style={{ position: "absolute", left: 770, top: 1500 }}>
      <Emoji name="starstruck" size={160} />
    </div>

    {/* Tên kênh */}
    <div style={{ position: "absolute", left: 90, width: 900, top: 1690, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "white",
          borderRadius: 40,
          padding: "10px 30px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 10px 24px rgba(60,0,10,0.45)",
        }}
      >
        <Emoji name="teacher" size={62} />
        <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 36, color: "#B4122B" }}>Cô giáo tiếng Anh thích A.I</span>
      </div>
    </div>
  </AbsoluteFill>
);
