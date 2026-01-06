const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

async function uploadSingleVideoAndCleanup(localVideoPath) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  if (!fs.existsSync(localVideoPath)) {
    throw new Error("Video file does not exist");
  }

  const bucket = "reels";
  const fileName = path.basename(localVideoPath);

  /* 1️⃣ List existing files */
  const { data: files, error: listError } = await supabase.storage
    .from(bucket)
    .list("", { limit: 100 });

  if (listError) throw listError;

  /* 2️⃣ Delete all other files */
  if (files?.length) {
    const toDelete = files
      .map((f) => f.name)
      .filter((name) => name !== fileName);

    if (toDelete.length) {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove(toDelete);

      if (deleteError) throw deleteError;
    }
  }

  /* 3️⃣ Upload new video (no overwrite, clean upload) */
  const fileBuffer = fs.readFileSync(localVideoPath);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  /* 4️⃣ Get public URL */
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return data.publicUrl;
}

module.exports = { uploadSingleVideoAndCleanup };
