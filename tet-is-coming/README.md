# Tet is coming! – video TikTok 9:16 (Remotion)

Video hook "Đừng cho học sinh đọc hội thoại chay" → biến trang SGK Tiếng Anh 8 Unit 5 (Getting Started) thành video hoạt hình.

## Thành phẩm (`out/`)
- `tet-is-coming.mp4` – bản chính 1080×1920, 30 fps, H.264, ~25 MB
- `tet-is-coming-nhe.mp4` – bản nhẹ ~11 MB
- `thumbnail.jpg` – ảnh bìa 1080×1920

## Chỉnh sửa
- Mốc thời gian, phụ đề, thẻ từ vựng, hiệu ứng âm thanh: `src/timeline.ts`
- Cảnh hook (sách, BORING, đũa thần): `src/Hook.tsx`
- Khung clip Tết, phụ đề, thẻ từ vựng: `src/ClipScene.tsx`
- Màn kết + âm thanh: `src/Main.tsx`; ảnh bìa: `src/Thumb.tsx`

## Lệnh
```bash
npm i
npx remotion studio          # xem trước
npx remotion render TetIsComing out/raw.mp4 --codec h264 --crf 17
npx remotion still Thumb out/thumb.png
```
Sau khi render: chuẩn hoá âm thanh `loudnorm I=-14 TP=-1.5` bằng ffmpeg rồi nén 2 bản (5.2 Mbps và 2.15 Mbps).

Icon 3D: Microsoft Fluent Emoji (MIT). Hiệu ứng âm thanh tự tổng hợp bằng ffmpeg.
