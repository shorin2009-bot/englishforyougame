import { Composition } from "remotion";
import { ZaloChat } from "./ZaloChat";
import { DemoDuGio, DEMO_DURATION, DEMO_FPS } from "./DemoDuGio";
import { END, FPS } from "./timeline";

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="ZaloDuGio"
        component={ZaloChat}
        durationInFrames={Math.round(END * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemoDuGio"
        component={DemoDuGio}
        durationInFrames={DEMO_DURATION}
        fps={DEMO_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
