import { Composition, getInputProps } from "remotion";
import { MainVideo } from "./mainVideo";

const script = {
  title: "Guard Your Tongue, Secure Paradise",
  hashtags: [
    "#IslamicWisdom",
    "#Hadith",
    "#ProphetMuhammad",
    "#MindfulSpeech",
    "#SelfControl",
    "#IslamicReminder",
    "#MuslimLife",
    "#Paradise",
    "#ReflectAndGrow",
    "#DailyInspiration",
    "#SpeakGoodOrBeSilent",
    "#TongueAndHands",
  ],
  caption:
    "Our words are a reflection of our hearts. These timeless teachings from Prophet Muhammad ﷺ offer profound guidance on the power of speech and silence, and the incredible reward for those who guard their tongues. Let's strive for mindful communication in every interaction. Save this reminder and reflect on its deep wisdom.",
  scenes: [
    {
      id: "s1",
      tokens: [
        {
          text: "The Messenger",
          importance: 2,
        },
      ],
    },
    {
      id: "s2",
      tokens: [
        {
          text: "of Allah ﷺ",
          importance: 2,
        },
      ],
    },
    {
      id: "s3",
      tokens: [
        {
          text: "said:",
          importance: 1,
        },
      ],
    },
    {
      id: "s4",
      tokens: [
        {
          text: "Whoever believes",
          importance: 2,
        },
      ],
    },
    {
      id: "s5",
      tokens: [
        {
          text: "in Allah",
          importance: 1,
        },
      ],
    },
    {
      id: "s6",
      tokens: [
        {
          text: "and the",
          importance: 0,
        },
      ],
    },
    {
      id: "s7",
      tokens: [
        {
          text: "Last Day,",
          importance: 2,
        },
      ],
    },
    {
      id: "s8",
      tokens: [
        {
          text: "let him",
          importance: 1,
        },
      ],
    },
    {
      id: "s9",
      tokens: [
        {
          text: "speak good,",
          importance: 2,
        },
      ],
    },
    {
      id: "s10",
      tokens: [
        {
          text: "or remain",
          importance: 1,
        },
      ],
    },
    {
      id: "s11",
      tokens: [
        {
          text: "silent.",
          importance: 2,
        },
      ],
    },
    {
      id: "s12",
      tokens: [
        {
          text: "And whoever",
          importance: 1,
        },
      ],
    },
    {
      id: "s13",
      tokens: [
        {
          text: "guarantees for me",
          importance: 2,
        },
      ],
    },
    {
      id: "s14",
      tokens: [
        {
          text: "what is between",
          importance: 1,
        },
      ],
    },
    {
      id: "s15",
      tokens: [
        {
          text: "his two jaws",
          importance: 2,
        },
      ],
    },
    {
      id: "s16",
      tokens: [
        {
          text: "and what is",
          importance: 1,
        },
      ],
    },
    {
      id: "s17",
      tokens: [
        {
          text: "between his",
          importance: 1,
        },
      ],
    },
    {
      id: "s18",
      tokens: [
        {
          text: "two legs,",
          importance: 2,
        },
      ],
    },
    {
      id: "s19",
      tokens: [
        {
          text: "I will",
          importance: 0,
        },
      ],
    },
    {
      id: "s20",
      tokens: [
        {
          text: "guarantee",
          importance: 2,
        },
      ],
    },
    {
      id: "s21",
      tokens: [
        {
          text: "for him",
          importance: 1,
        },
      ],
    },
    {
      id: "s22",
      tokens: [
        {
          text: "Paradise.",
          importance: 2,
        },
      ],
    },
  ],
  voiceover:
    "The Messenger of Allah ﷺ said: Whoever believes in Allah and the Last Day, let him speak good or remain silent. And whoever guarantees for me what is between his two jaws and what is between his two legs, I will guarantee for him Paradise.",
  id: "1767634694874",
  timestamp: "2026-01-05T17:38:14.874Z",
};

const audio = {
  audioPath: `audio/audio_1767634694874.mp3`,
  wordTimestamps: [
    {
      text: "The",
      start: 0,
      end: 0.163,
    },
    {
      text: "Messenger",
      start: 0.232,
      end: 0.673,
    },
    {
      text: "of",
      start: 0.755,
      end: 0.848,
    },
    {
      text: "Allah",
      start: 0.964,
      end: 1.37,
    },
    {
      text: "ﷺ",
      start: 1.416,
      end: 1.416,
    },
    {
      text: "said:",
      start: 1.416,
      end: 1.95,
    },
    {
      text: "Whoever",
      start: 2.159,
      end: 2.647,
    },
    {
      text: "believes",
      start: 2.728,
      end: 3.123,
    },
    {
      text: "in",
      start: 3.158,
      end: 3.228,
    },
    {
      text: "Allah",
      start: 3.297,
      end: 3.715,
    },
    {
      text: "and",
      start: 3.889,
      end: 4.122,
    },
    {
      text: "the",
      start: 4.156,
      end: 4.238,
    },
    {
      text: "Last",
      start: 4.319,
      end: 4.598,
    },
    {
      text: "Day,",
      start: 4.656,
      end: 5.155,
    },
    {
      text: "let",
      start: 5.433,
      end: 5.642,
    },
    {
      text: "him",
      start: 5.7,
      end: 5.817,
    },
    {
      text: "speak",
      start: 5.875,
      end: 6.211,
    },
    {
      text: "good",
      start: 6.293,
      end: 6.629,
    },
    {
      text: "or",
      start: 6.908,
      end: 7.082,
    },
    {
      text: "remain",
      start: 7.14,
      end: 7.442,
    },
    {
      text: "silent.",
      start: 7.523,
      end: 8.139,
    },
    {
      text: "And",
      start: 8.464,
      end: 8.638,
    },
    {
      text: "whoever",
      start: 8.719,
      end: 9.207,
    },
    {
      text: "guarantees",
      start: 9.288,
      end: 9.95,
    },
    {
      text: "for",
      start: 10.008,
      end: 10.159,
    },
    {
      text: "me",
      start: 10.228,
      end: 10.612,
    },
    {
      text: "what",
      start: 10.82,
      end: 11.041,
    },
    {
      text: "is",
      start: 11.099,
      end: 11.204,
    },
    {
      text: "between",
      start: 11.285,
      end: 11.68,
    },
    {
      text: "his",
      start: 11.726,
      end: 11.842,
    },
    {
      text: "two",
      start: 11.912,
      end: 12.132,
    },
    {
      text: "jaws",
      start: 12.214,
      end: 12.713,
    },
    {
      text: "and",
      start: 13.038,
      end: 13.224,
    },
    {
      text: "what",
      start: 13.317,
      end: 13.526,
    },
    {
      text: "is",
      start: 13.595,
      end: 13.688,
    },
    {
      text: "between",
      start: 13.758,
      end: 14.153,
    },
    {
      text: "his",
      start: 14.199,
      end: 14.315,
    },
    {
      text: "two",
      start: 14.373,
      end: 14.571,
    },
    {
      text: "legs,",
      start: 14.652,
      end: 15.267,
    },
    {
      text: "I",
      start: 15.65,
      end: 15.72,
    },
    {
      text: "will",
      start: 15.801,
      end: 15.952,
    },
    {
      text: "guarantee",
      start: 15.999,
      end: 16.556,
    },
    {
      text: "for",
      start: 16.602,
      end: 16.753,
    },
    {
      text: "him",
      start: 16.823,
      end: 17.043,
    },
    {
      text: "Paradise.",
      start: 17.287,
      end: 18.483,
    },
  ],
};

export const RemotionRoot = () => {
  // const input = getInputProps();
  // const { script, timestamps, audioSrc } = input ?? {};

  // if (!script || !timestamps || !audioSrc) {
  //   console.log("❌ Missing inputProps", { script, timestamps, audioSrc });
  //   return null;
  // }

  // FOR PREVIEW
  const timestamps = audio.wordTimestamps;
  const audioSrc = audio.audioPath;

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
