const fs = require("fs");
const path = require("path");
require("dotenv").config();
const axios = require("axios");
const { google } = require("googleapis");
const FormData = require("form-data");

/* ============================================
   SIMPLIFIED CONFIG
   ============================================ */
const CONFIG = {
  fb: { pageId: process.env.FB_PAGE_ID, token: process.env.FB_PAGE_TOKEN },
  ig: {
    businessId: process.env.IG_BUSINESS_ID,
    token: process.env.FB_PAGE_TOKEN,
  },
  yt: {
    clientId: process.env.YT_CLIENT_ID,
    clientSecret: process.env.YT_CLIENT_SECRET,
    refreshToken: process.env.YT_REFRESH_TOKEN,
  },
};

/* ============================================
   FACEBOOK UPLOAD
   ============================================ */
async function uploadToFacebook(videoPath, meta) {
  try {
    console.log("📤 Facebook...");

    const form = new FormData();
    form.append("file", fs.createReadStream(videoPath));
    form.append("description", meta.fb.description);
    form.append("title", meta.fb.title);
    form.append("published", "true");
    form.append("access_token", CONFIG.fb.token);

    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${CONFIG.fb.pageId}/videos`,
      form,
      { headers: form.getHeaders() }
    );

    console.log("Facebook response after uploading video ==> ", res.data);
    console.log("✅ Facebook:", res.data.id);
    return { success: true, id: res.data.id, platform: "facebook" };
  } catch (err) {
    console.error("❌ Facebook failed:", err.response?.data || err.message);
    return { success: false, platform: "facebook", error: err.message };
  }
}

/* ============================================
   INSTAGRAM UPLOAD (CREATE + PUBLISH)
   ============================================ */
async function uploadToInstagram(videoUrl, meta) {
  try {
    console.log("📤 Instagram...", videoUrl, meta);

    // Create media container
    const createRes = await axios.post(
      `https://graph.facebook.com/v19.0/${CONFIG.ig.businessId}/media`,
      {
        media_type: "REELS",
        video_url: videoUrl,
        caption: meta.ig.caption,
        access_token: CONFIG.ig.token,
      }
    );

    const containerId = createRes.data.id;
    console.log("createRes => ", createRes.data);

    await waitForInstagramProcessing(containerId, CONFIG.ig.token);

    // Publish it
    const publishRes = await axios.post(
      `https://graph.facebook.com/v19.0/${CONFIG.ig.businessId}/media_publish`,
      { creation_id: containerId, access_token: CONFIG.ig.token }
    );

    console.log("✅ Instagram:", publishRes.data.id);
    return { success: true, id: publishRes.data.id, platform: "instagram" };
  } catch (err) {
    console.error("❌ Instagram failed:", err.response?.data || err.message);
    return { success: false, platform: "instagram", error: err.message };
  }
}

async function waitForInstagramProcessing(containerId, token) {
  const maxAttempts = 20; // ~100 seconds
  let attempt = 0;

  while (attempt < maxAttempts) {
    const res = await axios.get(
      `https://graph.facebook.com/v19.0/${containerId}`,
      {
        params: {
          fields: "status_code",
          access_token: token,
        },
      }
    );

    const status = res.data.status_code;
    console.log(`IG processing status: ${status}`);

    if (status === "FINISHED") return true;
    if (status === "ERROR") throw new Error("Instagram processing failed");

    await new Promise((r) => setTimeout(r, 5000)); // wait 5 sec
    attempt++;
  }

  throw new Error("Instagram processing timeout");
}

/* ============================================
   YOUTUBE UPLOAD (WITH RESUMABLE UPLOAD)
   ============================================ */
async function uploadToYouTube(videoPath, meta) {
  try {
    console.log("📤 YouTube...");

    const oauth = new google.auth.OAuth2(
      CONFIG.yt.clientId,
      CONFIG.yt.clientSecret
    );
    oauth.setCredentials({ refresh_token: CONFIG.yt.refreshToken });

    const youtube = google.youtube({ version: "v3", auth: oauth });

    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: meta.yt.title,
          description: meta.yt.description,
          tags: meta.yt.tags || [],
          categoryId: "22",
        },
        status: { privacyStatus: "public", selfDeclaredMadeForKids: false },
      },
      media: { body: fs.createReadStream(videoPath) },
    });

    console.log("✅ YouTube:", res.data.id);
    return { success: true, id: res.data.id, platform: "youtube" };
  } catch (err) {
    console.error("❌ YouTube failed:", err.message);
    return { success: false, platform: "youtube", error: err.message };
  }
}

/* ============================================
   MAIN PUBLISHER
   ============================================ */
async function publishVideo({ localVideoUrl, publicVideoUrl, metadata }) {
  const results = [];
  try {
    // Run uploads in parallel
    const uploads = await Promise.allSettled([
      uploadToFacebook(localVideoUrl, metadata),
      uploadToInstagram(publicVideoUrl, metadata),
      uploadToYouTube(localVideoUrl, metadata),
    ]);
    uploads.forEach((upload) => {
      if (upload.status === "fulfilled") {
        results.push(upload.value);
      } else {
        results.push({
          success: false,
          error: upload.reason.message,
        });
      }
    });
    return {
      success: results.every((r) => r.success),
      uploads: results,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("❌ Publisher error:", err.message);
    return { success: false, error: err.message, uploads: results };
  }
}

module.exports = { publishVideo };
