const fs = require("fs");
const path = require("path");
const ensureDir = require("../../utils/ensureDir");
const { getClientWithCredits } = require("../../utils/elevenlabsKeymanager");

class AudioGenerator {
  constructor() {
    this.audioDir = path.join(process.cwd(), "public", "audio");
    ensureDir(this.audioDir);
  }

  async generate(scriptData) {
    console.log("🎙️ Generating narration with timestamps...");

    try {
      const estimatedChars = scriptData.voiceover.length;
      const { client } = await getClientWithCredits(estimatedChars);

      const response = await client.textToSpeech.convertWithTimestamps(
        "hfl88t2ykOiEML9u0YCe", // Noah
        {
          text: scriptData.voiceover,
          modelId: "eleven_multilingual_v2",
          outputFormat: "mp3_44100_128",
        }
      );

      console.log("Audio response generated.");
      // FIX 1: convertWithTimestamps returns a base64 string in 'audio'
      // We convert it to a Buffer to save it as a valid binary MP3
      const audioBuffer = Buffer.from(response.audioBase64, "base64");

      const fileName = `audio_${scriptData.id}.mp3`;
      const filePath = path.join(this.audioDir, fileName);

      // Save the file
      fs.writeFileSync(filePath, audioBuffer);
      console.log(`✅ Audio successfully saved: ${fileName}`);

      const wordTimestamps = buildWordsFromCharacters(response.alignment);

      const timestampDir = path.join(process.cwd(), "public", "timestamps");
      ensureDir(timestampDir);
      const timingFilePath = path.join(
        timestampDir,
        `timestamps_${scriptData.id}.json`
      );

      fs.writeFileSync(timingFilePath, JSON.stringify(wordTimestamps, null, 2));
      console.log(`🕒 Word timestamps saved to: ${timingFilePath}`);

      return {
        audioPath: `audio/${fileName}`,
        wordTimestamps,
        alignment: response.alignment,
      };
    } catch (error) {
      console.error("❌ ElevenLabs SDK Error:", error.message);
      throw error;
    }
  }
}

module.exports = AudioGenerator;

function buildWordsFromCharacters(alignment) {
  const {
    characters,
    characterStartTimesSeconds: character_start_times_seconds,
    characterEndTimesSeconds: character_end_times_seconds,
  } = alignment;
  const words = [];
  let currentWord = "";
  let startTime = null;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];

    // Ignore leading spaces/whitespace
    if (char.trim() === "") {
      if (currentWord.length > 0) {
        words.push({
          text: currentWord,
          start: startTime,
          end: character_end_times_seconds[i - 1],
        });
        currentWord = "";
        startTime = null;
      }
      continue;
    }

    if (currentWord === "") {
      startTime = character_start_times_seconds[i];
    }
    currentWord += char;
  }

  // Final word
  if (currentWord.length > 0) {
    words.push({
      text: currentWord,
      start: startTime,
      end: character_end_times_seconds[character_end_times_seconds.length - 1],
    });
  }

  return words;
}
