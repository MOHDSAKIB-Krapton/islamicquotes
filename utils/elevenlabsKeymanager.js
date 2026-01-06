const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

async function getClientWithCredits(minCharsNeeded = 0) {
  const KEYS = process.env.ELEVENLABS_KEYS?.split(",").map((k) => k.trim());

  if (!KEYS || KEYS.length === 0) {
    throw new Error("No ElevenLabs API keys provided");
  }

  console.log("KEYS => ", KEYS);
  for (const apiKey of KEYS) {
    try {
      const client = new ElevenLabsClient({ apiKey });

      const user = await client.user.get();
      const remaining =
        user.subscription?.characterLimit - user.subscription?.characterCount;

      if (remaining > minCharsNeeded) {
        return { client, apiKey, remaining };
      }
    } catch (err) {
      console.log("Error ==> ", err);
      // Ignore invalid / rate-limited keys
      continue;
    }
  }

  throw new Error("No ElevenLabs API key with sufficient credits available");
}

module.exports = { getClientWithCredits };
