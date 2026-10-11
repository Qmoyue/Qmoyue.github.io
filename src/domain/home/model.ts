import type { HomePageModel } from "../../framework/contracts/home";

interface HomeIdentity {
  subtitle: string;
  displayName: string;
  avatar: string;
  githubUrl: string;
}

interface HomeContent {
  terminal: HomePageModel["terminal"];
  avatarFrameImage: string;
  avatarSpeech: string;
  cue: string;
  flowerImage: string;
  profileGreeting: HomePageModel["profileGreeting"];
  quoteImage: string;
  quote: HomePageModel["quote"];
  fallingWords: HomePageModel["fallingWords"];
}

export function createHomePageModel(
  identity: HomeIdentity,
  content: HomeContent,
  renderedAt: Date,
): HomePageModel {
  if (content.fallingWords.length === 0)
    throw new Error("Falling tags need at least one word");

  return {
    renderedAt: renderedAt.toISOString(),
    identity,
    ...content,
  };
}
