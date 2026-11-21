import React from "react";
import { Composition, Still } from "remotion";
import { TetIsComing } from "./Main";
import { Thumb } from "./Thumb";
import { FPS, H, TOTAL_F, W } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TetIsComing" component={TetIsComing} durationInFrames={TOTAL_F} fps={FPS} width={W} height={H} />
    <Still id="Thumb" component={Thumb} width={W} height={H} />
  </>
);
