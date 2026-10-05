export interface HomePageModel {
  renderedAt: string;
  identity: {
    subtitle: string;
    displayName: string;
    avatar: string;
    githubUrl: string;
  };
  guitarImage: string;
  avatarSpeech: string;
  cue: string;
  terminal: {
    host: string;
    path: string;
    command: string;
    output: string;
    hint: string;
  };
  latest: {
    href: string;
    title: string;
    description: string;
    coverSrc: string;
    coverAlt: string;
    pubDate: string;
    dateLabel: string;
    tags: readonly string[];
    wordsLabel: string;
  };
  flowerImage: string;
  profileGreeting: { intro: string; outro: string };
  quote: readonly [string, string];
  fallingWords: readonly string[];
}

export type HomeBlockArea =
  "latest" | "flower" | "profile" | "clock" | "calendar" | "quote";
