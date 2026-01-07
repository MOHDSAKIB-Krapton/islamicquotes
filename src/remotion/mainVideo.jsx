import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useMemo } from "react";

const amiri = loadAmiri();
amiri.waitUntilDone();

const isArabic = (t) => /[\u0600-\u06FF]/.test(t);

// Enhanced animation library with creative multi-step animations
const ANIMATION_LIBRARY = {
  1: ["SINGLE_EXPAND", "SINGLE_GLOW", "SINGLE_DROP"],
  2: ["DUO_SLIDE", "DUO_FLIP", "DUO_FOCUS"],
  3: ["TRIO_CASCADE", "TRIO_HERO_CENTER", "TRIO_STAGGER"],
  4: ["QUARTET_FLOW", "QUARTET_GRID", "QUARTET_EASE"],
  default: ["SOFT_STAGGER", "CLEAN_FADE", "PHRASE_RISE"],
};

function getAnimationForScene(wordCount, index) {
  const options = ANIMATION_LIBRARY[wordCount] || ANIMATION_LIBRARY.default;
  return options[index % options.length];
}

// Calculate dynamic timing based on scene characteristics
function getSceneTiming(frameCount, wordCount) {
  const readingTimePerWord = 15; // frames per word (at 30fps ≈ 0.5 sec)
  const minReadingTime = readingTimePerWord * wordCount;

  // Use actual frame duration if longer, otherwise add buffer
  const hasEnoughTime = frameCount > minReadingTime;

  return {
    hasEnoughTime,
    wordDelay: hasEnoughTime
      ? Math.max(4, Math.floor(frameCount / (wordCount * 2)))
      : 3,
    staggerMultiplier: hasEnoughTime ? 1.5 : 0.8,
    springConfig: hasEnoughTime
      ? { damping: 18, stiffness: 80 } // slower, smoother
      : { damping: 22, stiffness: 120 }, // slightly faster but controlled
  };
}

const THEMES = [
  // 2. Parchment Light (KEEP)
  {
    bg: ["#f6e9d3", "#7b6b64"],
    text: "#3e2723",
    accent: "#755f5c",
  },
];

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const MainVideo = ({ data, audioPath, timestamps }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const baseSize = Math.min(width, height);

  const countWords = (text) =>
    (text || "").trim().split(/\s+/).filter(Boolean).length;

  const timeline = useMemo(() => {
    let cursor = 0; // word index in timestamps
    const grouped = [];

    for (let groupIdx = 0; groupIdx < data.scenes.length; groupIdx += 3) {
      const sceneBatch = data.scenes.slice(groupIdx, groupIdx + 3);
      const allTokens = sceneBatch.flatMap((s) => s.tokens);

      // ✅ build per-token timings by consuming wordTimestamps sequentially
      const tokenTimings = [];
      for (let i = 0; i < allTokens.length; i++) {
        const wc = countWords(allTokens[i].text);

        const first = timestamps[cursor];
        const last = timestamps[cursor + wc - 1];

        if (!first || !last) break;

        tokenTimings.push({ start: first.start, end: last.end });

        cursor += wc;
      }

      if (tokenTimings.length === 0) break;

      const startSec = tokenTimings[0].start;
      const endSec = tokenTimings[tokenTimings.length - 1].end;

      const start = Math.floor(startSec * fps);
      const end = Math.ceil(endSec * fps);
      const frames = end - start;

      // use WORD count for animation selection / timing
      const totalWords = allTokens.reduce(
        (sum, t) => sum + countWords(t.text),
        0
      );

      const animationType = getAnimationForScene(
        totalWords,
        Math.floor(groupIdx / 3)
      );
      const timing = getSceneTiming(frames, totalWords);

      const theme = THEMES[grouped.length % THEMES.length];

      grouped.push({
        tokens: allTokens,
        tokenTimings, // ✅ IMPORTANT
        animationType,
        start,
        end,
        frames,
        timing,
        theme,
      });
    }

    return grouped;
  }, [data.scenes, timestamps, fps]);

  const scene = useMemo(() => {
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (frame >= timeline[i].start) {
        return timeline[i];
      }
    }
    return timeline[0];
  }, [frame, timeline]);
  const activeTheme = scene?.theme ?? THEMES[0];

  // AFTER timeline + scene resolution
  const sceneIndex = timeline.indexOf(scene);
  const isLastScene = sceneIndex === timeline.length - 1;
  const prevScene = timeline[Math.max(0, sceneIndex - 1)] ?? scene;
  const localFrame = frame - scene.start;
  const fade = Math.min(10, Math.floor(scene.frames / 2));

  const sceneOpacity = isLastScene
    ? 1
    : interpolate(
        localFrame,
        [0, fade, scene.frames - fade, scene.frames],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  // Color transition progress
  const progress = spring({
    frame: frame - scene.start,
    fps,
    config: { damping: 30, stiffness: 60 },
  });

  // Background color interpolation
  const [r1, g1, b1] = hexToRgb(prevScene.theme.bg[0]);
  const [r2, g2, b2] = hexToRgb(scene.theme.bg[0]);

  const bgColor = `rgb(
  ${interpolate(progress, [0, 1], [r1, r2])},
  ${interpolate(progress, [0, 1], [g1, g2])},
  ${interpolate(progress, [0, 1], [b1, b2])}
)`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        color: activeTheme.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {audioPath && <Audio src={staticFile(audioPath)} />}
      {audioPath && <Audio src={staticFile("nasheed_2.mp3")} volume={0.05} />}

      {frame === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: "85%",
            gap: 24,
          }}
        >
          {/* CATEGORY */}
          <div
            style={{
              fontSize: baseSize * 0.045,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontFamily: "'Amiri', serif",
              fontWeight: 600,
              color: activeTheme.accent,
              opacity: 0.9,
            }}
          >
            Today’s Wisdom
          </div>

          {/* MAIN QUOTE / HOOK */}
          <div
            style={{
              fontSize: baseSize * 0.13,
              lineHeight: 1.25,
              fontFamily: "'Amiri', serif",
              fontWeight: 700,
              color: activeTheme.text,
            }}
          >
            {data.thumbnailText ?? data.title}
          </div>

          {/* DIVIDER */}
          <div
            style={{
              width: "120px",
              height: "2px",
              backgroundColor: activeTheme.accent,
              opacity: 0.6,
            }}
          />

          <div
            style={{
              fontSize: baseSize * 0.055,
              fontFamily: "'Amiri', serif",
              fontWeight: 500,
              color: activeTheme.text,
              opacity: 0.9,
            }}
          >
            Prophet Muhammad ﷺ
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: sceneOpacity,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              // columnGap: "40px",
              columnGap: `${Math.max(16, baseSize * 0.03)}px`,
              textAlign: "center",
              maxWidth: "90%",
            }}
          >
            {scene.tokens.map((token, i) => {
              const { springConfig } = scene.timing;
              const activeTheme = scene.theme;

              const t = scene.tokenTimings?.[i];

              // If timing missing, just show it immediately
              const absStart =
                t?.start != null ? Math.round(t.start * fps) : scene.start;

              const tokenStartFrameInScene = Math.max(
                0,
                absStart - scene.start
              );

              const spr = spring({
                frame: localFrame - tokenStartFrameInScene,
                fps,
                config: springConfig,
              });

              const isHero = token.importance >= 2;
              const arabic = isArabic(token.text);

              let x = 0;
              let y = 0;
              let scale = 1;
              let blur = 0;
              let opacity = spr;
              let rotation = 0;
              let letterSpacing = 0;

              // Enhanced animation types with more visual interest
              switch (scene.animationType) {
                case "SINGLE_EXPAND":
                  scale = interpolate(spr, [0, 1], [0.6, 1]);
                  blur = interpolate(spr, [0, 1], [20, 0]);
                  letterSpacing = interpolate(spr, [0, 1], [20, 0]);
                  break;

                case "SINGLE_GLOW":
                  scale = interpolate(spr, [0, 0.5, 1], [0.9, 1.1, 1]);
                  blur = interpolate(spr, [0, 0.5, 1], [10, 0, 0]);
                  break;

                case "SINGLE_DROP":
                  y = interpolate(spr, [0, 1], [-50, 0]);
                  opacity = spr;
                  break;

                case "DUO_SLIDE":
                  x =
                    i === 0
                      ? interpolate(spr, [0, 1], [-50, 0])
                      : interpolate(spr, [0, 1], [50, 0]);
                  blur = interpolate(spr, [0, 1], [10, 0]);
                  break;

                case "DUO_FLIP":
                  rotation =
                    i === 0
                      ? interpolate(spr, [0, 1], [-45, 0])
                      : interpolate(spr, [0, 1], [45, 0]);
                  scale = interpolate(spr, [0, 1], [0.5, 1]);
                  break;

                case "TRIO_HERO_CENTER":
                  if (i === 1) {
                    scale = interpolate(spr, [0, 1], [0.8, 1.15]);
                    blur = 0;
                  } else {
                    scale = interpolate(spr, [0, 1], [0.7, 1]);
                  }
                  y = interpolate(spr, [0, 1], [i === 1 ? -20 : 20, 0]);
                  break;

                case "TRIO_CASCADE":
                  y = interpolate(spr, [0, 1], [-(40 + i * 25), 0]);
                  rotation = interpolate(spr, [0, 1], [20, 0]);
                  break;

                case "TRIO_STAGGER":
                  opacity = interpolate(spr, [0, 0.7, 1], [0, 0.5, 1]);
                  scale = interpolate(spr, [0, 1], [0.5, 1]);
                  x = interpolate(spr, [0, 1], [i % 2 === 0 ? -30 : 30, 0]);
                  break;

                case "QUARTET_FLOW":
                  opacity = interpolate(spr, [0, 0.8], [0, 1]);
                  y = Math.sin(i + localFrame * 0.02) * 8;
                  scale = 1 + Math.cos(i + localFrame * 0.02) * 0.1;
                  break;

                case "QUARTET_GRID":
                  const row = Math.floor(i / 2);
                  const col = i % 2;
                  x = interpolate(spr, [0, 1], [(col - 0.5) * 60, 0]);
                  y = interpolate(spr, [0, 1], [(row - 0.5) * 40, 0]);
                  scale = interpolate(spr, [0, 1], [0.6, 1]);
                  break;

                case "QUARTET_EASE":
                  opacity = spr;
                  scale = interpolate(spr, [0, 0.5, 1], [0.8, 1.05, 1]);
                  y = interpolate(spr, [0, 1], [30, 0]);
                  break;

                case "SOFT_STAGGER":
                  y = interpolate(spr, [0, 1], [20, 0]);
                  scale = interpolate(spr, [0, 1], [0.9, 1]);
                  opacity = spr;
                  break;

                case "CLEAN_FADE":
                  opacity = spr;
                  scale = interpolate(spr, [0, 1], [0.95, 1]);
                  break;

                case "PHRASE_RISE":
                  y = interpolate(spr, [0, 1], [30, 0]);
                  opacity = spr;
                  break;

                default:
                  y = interpolate(spr, [0, 1], [25, 0]);
                  break;
              }

              return (
                <div
                  key={i}
                  style={{
                    opacity: Math.max(0, Math.min(1, opacity)),
                    transform: `
                    translate(${x}px, ${y}px)
                    scale(${scale})
                    rotateZ(${rotation}deg)
                  `,
                    filter: blur > 0 ? `blur(${blur}px)` : "none",
                    lineHeight: 1.4,
                    fontFamily: "'Amiri', serif",
                    fontWeight: isHero ? 700 : 400,
                    color: isHero ? activeTheme.accent : activeTheme.text,
                    letterSpacing: `${letterSpacing}px`,
                    // whiteSpace: "nowrap",
                    fontSize: isHero ? baseSize * 0.12 : baseSize * 0.1,
                    whiteSpace: token.text.length > 12 ? "normal" : "nowrap",

                    transition: "none",
                    alignSelf: "baseline",
                  }}
                >
                  {token.text}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Handle use this later on */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: "95%",
          display: "flex",
          justifyContent: "center",
          fontSize: 40,
        }}
      >
        @IslamicQuotes
      </div>
    </AbsoluteFill>
  );
};
