import type {
  HomeContent,
  HomePageModel,
} from "../../framework/contracts/home";

export function createHomePageModel(
  identity: HomePageModel["identity"],
  content: HomeContent,
  renderedAt: Date,
  links: HomePageModel["links"],
): HomePageModel {
  if (content.fallingWords.length === 0)
    throw new Error("Falling tags need at least one word");

  return {
    renderedAt: renderedAt.toISOString(),
    links,
    identity: {
      subtitle: identity.subtitle,
      displayName: identity.displayName,
      avatar: identity.avatar,
      githubUrl: identity.githubUrl,
    },
    ...content,
  };
}
