import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import { continueRender, delayRender } from "remotion";

export const TITLE = `"Baloo 2", "Be Vietnam Pro", sans-serif`;
export const BODY = `"Be Vietnam Pro", "Baloo 2", sans-serif`;

const SAMPLE = "Aa Đừng nha chán lắm hội thoại ẮẰẲẴẶ ếềểễệ";
const handle = delayRender("Loading fonts");
Promise.all([
  document.fonts.load(`800 60px "Baloo 2"`, SAMPLE),
  document.fonts.load(`700 60px "Baloo 2"`, SAMPLE),
  document.fonts.load(`600 40px "Be Vietnam Pro"`, SAMPLE),
  document.fonts.load(`700 40px "Be Vietnam Pro"`, SAMPLE),
  document.fonts.load(`800 40px "Be Vietnam Pro"`, SAMPLE),
])
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));
