import type { NavigationItem } from "../framework/contracts/navigation";

export const site = {
  name: "moyue's blog",
  displayName: "Moyue",
  subtitle: "personal blog / telepathic waves",
  description: "记录开发、二次元兴趣、项目折腾和一点点日常回声的小房间。",
  githubUrl: "https://github.com/Qmoyue/Qmoyue.github.io",
  avatar: "/images/avatar.jpg",
  doro: "/images/doro.png",
  socialImage: "/images/mygo1.jpg",
  footer: {
    line: "学习笔记 & 漏洞研究",
    status: "sakura: falling / doro: on duty",
  },
};

export const navItems = [
  { href: "/", label: "HOME", subtitle: "front page", icon: "home" },
  { href: "/blog/", label: "BLOG", subtitle: "notes", icon: "blog" },
  {
    href: "/project/",
    label: "PROJECT",
    subtitle: "projects",
    icon: "project",
  },
  { href: "/friends/", label: "FRIENDS", subtitle: "links", icon: "friends" },
  { href: "/me/", label: "ME", subtitle: "profile", icon: "me" },
] satisfies NavigationItem[];

for (const [name, value] of Object.entries({
  name: site.name,
  displayName: site.displayName,
  description: site.description,
})) {
  if (!value.trim()) throw new Error(`Site ${name} is required`);
}

for (const item of navItems) {
  if (
    !item.href.startsWith("/") ||
    item.href.startsWith("//") ||
    !item.label.trim()
  ) {
    throw new Error("Navigation items need a local href and label");
  }
}
