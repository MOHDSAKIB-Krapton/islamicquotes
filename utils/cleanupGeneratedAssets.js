const fs = require("fs/promises");
const path = require("path");

/**
 * Cleanup all generated assets
 * Runs ONLY after all platforms succeed
 */
async function cleanupGeneratedAssets(id) {
  const basePublicPath = path.resolve(process.cwd(), "public");

  const targets = [
    path.join(basePublicPath, "audio", `audio_${id}.mp3`),
    path.join(basePublicPath, "videos", `reel_${id}.mp4`),
    path.join(basePublicPath, "scripts", `script_${id}.json`),
    path.join(basePublicPath, "timestamps", `timestamps_${id}.json`),
  ];

  let issuFound = false;
  for (const file of targets) {
    try {
      await fs.unlink(file);
      console.log("🧹 Deleted:", file);
    } catch (err) {
      // Do NOT crash cleanup if one file is missing
      console.warn("⚠️ Cleanup skipped (not found):", file);
      issuFound = true;
      continue;
    }
  }

  return {
    success: !issuFound,
    message: issuFound
      ? "Cleanup Cound not be done successfully"
      : "Cleanup completed successfully",
  };
}

function allPlatformsSucceeded(uploadResult) {
  return (
    uploadResult?.success === true &&
    Array.isArray(uploadResult.uploads) &&
    uploadResult.uploads.every((u) => u.success === true)
  );
}

module.exports = { cleanupGeneratedAssets, allPlatformsSucceeded };
