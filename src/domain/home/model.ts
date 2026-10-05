import type { PostSummary } from "../blog/posts";
import type { HomePageModel } from "../../framework/contracts/home";
import { formatDate } from "../../lib/dates";

interface HomeIdentity {
  subtitle: string;
  displayName: string;
  avatar: string;
  githubUrl: string;
}

interface HomeContent {
  terminal: HomePageModel["terminal"];
  guitarImage: string;
  avatarSpeech: string;
  cue: string;
  flowerImage: string;
  profileGreeting: HomePageModel["profileGreeting"];
  quote: HomePageModel["quote"];
  fallingWords: HomePageModel["fallingWords"];
}

type HomePostSource = Pick<
  PostSummary,
  "href" | "title" | "description" | "coverAlt" | "pubDate" | "tags" | "words"
>;

export function createHomePageModel(
  identity: HomeIdentity,
  content: HomeContent,
  latest: HomePostSource | undefined,
  coverSrc: string,
  renderedAt: Date,
): HomePageModel {
  if (!latest)
    throw new Error("The home latest-post block needs a published post");
  if (!coverSrc)
    throw new Error("The home latest-post block needs a cover URL");
  if (content.fallingWords.length === 0)
    throw new Error("Falling tags need at least one word");

  return {
    renderedAt: renderedAt.toISOString(),
    identity,
    ...content,
    latest: {
      href: latest.href,
      title: latest.title,
      description: latest.description,
      coverSrc,
      coverAlt: latest.coverAlt,
      pubDate: latest.pubDate.toISOString(),
      dateLabel: formatDate(latest.pubDate),
      tags: latest.tags.slice(0, 2),
      wordsLabel: `${latest.words.toLocaleString("zh-CN")} 字`,
    },
  };
}
