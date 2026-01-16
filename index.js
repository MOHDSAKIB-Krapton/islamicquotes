require("dotenv").config();
const AudioGenerator = require("./src/generators/audioGenerators");
const ScriptGenerator = require("./src/generators/scriptGenerator");
const renderVideo = require("./src/remotion/render-video");
const { publishVideo } = require("./src/upload/upload");
const path = require("path");
const { uploadSingleVideoAndCleanup } = require("./supabase");
const {
  cleanupGeneratedAssets,
  allPlatformsSucceeded,
} = require("./utils/cleanupGeneratedAssets");

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY missing");
    process.exit(1);
  }

  try {
    const generator = new ScriptGenerator(apiKey);
    const script = await generator.generate();
    console.log("Script Done.", script);

    const audioGenerator = new AudioGenerator();
    const audio = await audioGenerator.generate(script);
    console.log("Audio Done.", audio);

    const videoPath = await renderVideo({
      id: script.id,
      script: script,
      audio: audio.audioPath,
      timestamps: audio.wordTimestamps,
    });

    console.log("✅ DONE => ", videoPath);

    const localVideoUrl = path.resolve(
      process.cwd(),
      "public/videos",
      `reel_${script.id}.mp4`
    );

    console.log("Uploading reel to storage");
    const publicVideoUrl = await uploadSingleVideoAndCleanup(localVideoUrl);
    console.log("Uploaded reel to storage...");

    console.log("Publishing to social media pplatforms");
    const res = await publishVideo({
      localVideoUrl,
      publicVideoUrl,
      metadata: {
        fb: {
          title: script.title,
          description: `${script.caption}\n\n${script.hashtags.join(" ")}`,
        },
        ig: {
          caption: `${script.caption}\n\n${script.hashtags.join(" ")}`,
        },
        yt: {
          title: script.title,
          description: script.caption,
          tags: script.hashtags,
        },
      },
    });

    console.log("Uploaded reel on all Platforms  ==> ", res);

    if (allPlatformsSucceeded(res)) {
      const res = await cleanupGeneratedAssets(script.id);
      console.log("Response after cleanup ==> ", res);
    } else {
      console.log("⚠️ Cleanup skipped — not all platforms succeeded");
    }
  } catch (err) {
    console.log(err);
  }
}

main();
