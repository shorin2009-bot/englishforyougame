import { Composition } from "remotion";
import { ZaloChat } from "./ZaloChat";
import { END, FPS } from "./timeline";

export const MyComposition = () => {
  return (
    <Composition
      id="ZaloDuGio"
      component={ZaloChat}
      durationInFrames={Math.round(END * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
