const path = require("path");
const fs = require("fs");
const ensureDir = require("../../utils/ensureDir");
const { bundle } = require("@remotion/bundler");
const {
  renderMedia,
  selectComposition,
  ensureBrowser,
} = require("@remotion/renderer");

module.exports = async function renderVideo({ id, script, audio, timestamps }) {
  console.log("Data inside rendervideo => ", audio);

  const videoDir = path.join(process.cwd(), "public", "videos");
  ensureDir(videoDir);

  const audioAbs = path.resolve(process.cwd(), "public", audio);
  if (!fs.existsSync(audioAbs)) {
    throw new Error(`Audio file not found: ${audioAbs}`);
  }

  const entry = path.join(
    process.cwd(),
    "src",
    "remotion",
    "remotion-entry.mjs"
  );

  const serveUrl = await bundle(entry);
  const outPath = path.join(videoDir, `reel_${id}.mp4`);

  const inputProps = {
    script,
    timestamps,
    audioSrc: audio,
  };

  const composition = await selectComposition({
    serveUrl,
    id: "IslamicQuotePro",
    inputProps,
    logLevel: "verbose",
    chromeMode: "headless-shell",
    onBrowserLog: (log) => console.log("🟦 [SELECT BROWSER]", log.text),
  });

  console.log("✅ Composition selected:", {
    id: composition.id,
    durationInFrames: composition.durationInFrames,
    fps: composition.fps,
  });

  // await renderMedia({
  //   serveUrl,
  //   composition,
  //   codec: "h264",
  //   outputLocation: outPath,
  //   audioCodec: "mp3",
  //   inputProps,
  //   logLevel: "verbose",
  //   chromeMode: "headless-shell",
  //   timeoutInMilliseconds: 30000,
  //   onProgress: ({ progress }) => {
  //     process.stdout.write(`\rRendering: ${Math.round(progress * 100)}%`);
  //   },
  // });

  await renderMedia({
    serveUrl,
    composition,
    outputLocation: outPath,
    codec: "h264",
    crf: 16,
    x264Preset: "slow",
    pixelFormat: "yuv420p",
    audioCodec: "mp3",
    inputProps,
    chromeMode: "headless-shell",
    timeoutInMilliseconds: 600000,
    logLevel: "verbose",

    onProgress: ({ progress }) => {
      process.stdout.write(`\rRendering: ${Math.round(progress * 100)}%`);
    },
  });

  console.log("\n✅ Render done:", outPath);
  return outPath;
};
