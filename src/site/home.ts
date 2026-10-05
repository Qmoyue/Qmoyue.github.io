import type { HomePageModel } from "../framework/contracts/home";

export const homeContent = {
  guitarImage: "/images/guitar-cutout.png",
  avatarSpeech: "Bobobobocchi desu!",
  cue: "scroll / space",
  terminal: {
    host: "moyue@blog:~",
    path: "~/moyue/blog",
    command: "cat /flag",
    output: "flag{welcome_to_moyues_blog}",
    hint: "学习笔记 / 漏洞研究 / 一点点电波",
  },
  flowerImage: "/images/flower.jpg",
  profileGreeting: { intro: "I'm", outro: "Nice to meet you!" },
  quote: ["「梦是现实的延续，", "现实是梦的终结。」"],
  fallingWords: [
    "少女乐队",
    "二次元",
    "web安全",
    "agent",
    "月美",
    "[oblivious]",
    "ギター英雄",
    "だから僕は音楽を辞めた",
    "私が神になります",
    "個性を捨てたら、死んだも同然",
  ],
} satisfies Pick<
  HomePageModel,
  | "terminal"
  | "guitarImage"
  | "avatarSpeech"
  | "cue"
  | "flowerImage"
  | "profileGreeting"
  | "quote"
  | "fallingWords"
>;
