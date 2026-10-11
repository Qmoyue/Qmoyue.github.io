export interface HomePageModel {
  renderedAt: string;
  identity: {
    subtitle: string;
    displayName: string;
    avatar: string;
    githubUrl: string;
  };
  avatarFrameImage: string;
  avatarSpeech: string;
  cue: string;
  terminal: {
    host: string;
    path: string;
    command: string;
    output: string;
  };
  flowerImage: string;
  profileGreeting: { intro: string; outro: string };
  quoteImage: string;
  quote: readonly [string, string];
  fallingWords: readonly string[];
}
