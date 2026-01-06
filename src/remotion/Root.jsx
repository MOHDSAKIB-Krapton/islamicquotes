import { Composition, getInputProps } from "remotion";
import { MainVideo } from "./mainVideo";

export const RemotionRoot = () => {
  const input = getInputProps();
  const { script, timestamps, audioSrc } = input ?? {};

  if (!script || !timestamps || !audioSrc) {
    console.log("❌ Missing inputProps", { script, timestamps, audioSrc });
    return null;
  }

  // FOR PREVIEW
  // const timestamps = audio.wordTimestamps;
  // const audioSrc = audio.audioPath;

  const FPS = 30;
  const EXTRA_SECONDS = 1;

  const lastEnd = timestamps[timestamps.length - 1].end;
  const durationInFrames = Math.ceil((lastEnd + EXTRA_SECONDS) * FPS);

  return (
    <>
      <Composition
        id="IslamicQuotePro"
        component={MainVideo}
        fps={30}
        width={1080}
        height={1920}
        durationInFrames={durationInFrames}
        defaultProps={{
          data: {
            scenes: [...script.scenes],
            title: script.title,
          },
          timestamps,
          audioPath: audioSrc ?? null,
        }}
      />
    </>
  );
};
