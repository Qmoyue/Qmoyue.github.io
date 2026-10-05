export interface TechStackItem {
  name: string;
  description: string;
  icon: string;
  tone: "pink" | "mint" | "yellow" | "peach";
}

export interface ProfileContent {
  scriptName: string;
  bio: string;
  headline: string;
  introduction: string;
  interests: readonly string[];
  techStack: readonly TechStackItem[];
  emptyTechMessage: string;
}
