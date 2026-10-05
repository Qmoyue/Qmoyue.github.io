import { defineBlogConfig } from "../framework/contracts/config";
import { moyuePreset } from "../presets/moyue";

export const blogConfig = defineBlogConfig({
  preset: moyuePreset,
  site: {
    name: "moyue's blog",
    owner: "moyue",
    displayName: "Moyue",
    subtitle: "personal blog / telepathic waves",
    description: "记录开发、二次元兴趣、项目折腾和一点点日常回声的小房间。",
    signature: "在温柔的粉蓝色里，把喜欢的事慢慢写下来。",
    githubUrl: "https://github.com/Qmoyue/Qmoyue.github.io",
    avatar: "/images/avatar.jpg",
    doro: "/images/doro.png",
    homeFirstBackground: "/images/mygo1.jpg",
    homeAltBackground: "/images/flower.jpg",
    homeSecondBackground: "/images/muzimi.png",
    footer: {
      line: "学习笔记、漏洞研究，还有一点点电波。",
      status: "sakura: falling / doro: on duty",
      backgroundImage: "/images/muzimi.png",
    },
    email: "hello@example.com",
  },
  navigation: [
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
  ],
});

export const site = blogConfig.site;
export const navItems = blogConfig.navigation;
