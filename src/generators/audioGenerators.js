const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");
const { Readable } = require("stream");
const fs = require("fs");
const path = require("path");
const ensureDir = require("../../utils/ensureDir");

class AudioGenerator {
  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    this.audioDir = path.join(process.cwd(), "public", "audio");
    ensureDir(this.audioDir);
  }

  // async generate(scriptData) {
  //   console.log("🎙️ Generating elite human narration...");

  //   // Pacing logic: ... creates natural breathing room in ElevenLabs
  //   const cleanText = `${scriptData.hook}. ... ${scriptData.quote}. ... ${scriptData.context}. ... ${scriptData.cta}`;

  //   try {
  //     const response = await this.client.textToSpeech.convertWithTimestamps(
  //       "JBFqnCBsd6RMkjVDRZzb", // George
  //       {
  //         text: cleanText,
  //         modelId: "eleven_multilingual_v2",
  //         outputFormat: "mp3_44100_128",
  //       }
  //     );

  //     console.log("📊 Generation Audio : ", response);
  //     const fileName = `audio_${scriptData.id}.mp3`;
  //     const filePath = path.join(this.outputDir, fileName);
  //     const fileStream = fs.createWriteStream(filePath);

  //     // 2. THE FIX: Convert Web Stream to Node Stream before piping
  //     const nodeStream = Readable.from(response.audio);

  //     await new Promise((resolve, reject) => {
  //       nodeStream.pipe(fileStream);

  //       fileStream.on("finish", () => {
  //         console.log(`✅ Audio successfully saved: ${fileName}`);
  //         resolve({
  //           path: filePath,
  //           id: scriptData.id,
  //         });
  //       });

  //       fileStream.on("error", (err) => {
  //         console.error("❌ File System Error:", err);
  //         reject(err);
  //       });

  //       nodeStream.on("error", (err) => {
  //         console.error("❌ Stream Error:", err);
  //         reject(err);
  //       });
  //     });

  //     const alignment = response.alignment;
  //     console.log("📊 Alignment Data : ", alignment);
  //     console.log(
  //       "🛠️ Building word-level timestamps from character-level data...",
  //       buildWordsFromCharacters(alignment)
  //     );

  //     return {
  //       audioPath: filePath,
  //       alignment,
  //     };
  //   } catch (error) {
  //     console.error("❌ ElevenLabs SDK Error:", error.message);
  //     //   throw error;
  //   }
  // }

  async generate(scriptData) {
    console.log("🎙️ Generating narration with timestamps...");

    // const cleanText = `${scriptData.hook}. ${scriptData.quote}. ${scriptData.context}. ${scriptData.cta}`;

    try {
      const response = await this.client.textToSpeech.convertWithTimestamps(
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
