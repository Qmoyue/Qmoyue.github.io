import type { FriendLink } from "../framework/contracts/friend";

// Remote avatars are fetched by the browser; do not proxy or replace failures silently.
export const friends: readonly FriendLink[] = [
  {
    name: "Nick Chen",
    url: "https://www.nickchen.top/",
    avatar: "https://www.nickchen.top/_astro/avatar.CHzblvB9_Le9XL.avif",
  },
  {
    name: "yuoooka",
    url: "https://yuoooka.cn/",
    avatar:
      "https://yuoooka.cn/api/picture?id=b_457bd718905b17ac0d06059d9a11c590.jpg",
  },
  {
    name: "wuye",
    url: "https://www.mgoyy.cn/",
    avatar: "https://www.mgoyy.cn/images/b0c1d74766dd8bce0ad860be15c46993a.jpg",
  },
  {
    name: "jsnow",
    url: "https://j5now.github.io/",
    avatar: "https://j5now.github.io/img/me.jpg",
  },
  {
    name: "snowcat",
    url: "https://www.sadsnowcat.com/",
    avatar: "https://sadsnowcat.com/images/head.jpg",
  },
  {
    name: "duxing",
    url: "https://s0lowalker.github.io/",
    avatar: "https://s0lowalker.github.io/images/logo/solowalker.png",
  },
  {
    name: "Maxton‘s Blog",
    url: "https://zh.maxtonniu.com/",
    avatar: "https://zh.maxtonniu.com/favicon/favicon.ico",
  },
];
