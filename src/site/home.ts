import type { HomeContent } from "../framework/contracts/home";

export const homeContent = {
  avatarFrameImage: "/images/avatar-frame-guitar.png",
  avatarSpeech: "Bobobobocchi desu!",
  cue: "scroll / space",
  terminal: {
    host: "moyue@Qmoyue",
    path: "~",
    command: "cat /flag",
    output: "flag{welcome_to_moyues_blog}",
  },
  flowerImage: "/images/flower.jpg",
  profileGreeting: { intro: "I'm", outro: "Nice to meet you!" },
  quoteImage: "/images/quote-character.png",
  quote: ["「梦是现实的延续，", "现实是梦的终结。」"],
  fallingWords: [
    "少女乐队",
    "二次元",
    "web安全",
    "agent",
    "TYPE-MOON",
    "[oblivious]",
    "ギター英雄",
    "だから僕は音楽を辞めた",
    "私が神になります",
    "個性を捨てたら、死んだも同然",
  ],
} satisfies HomeContent;
