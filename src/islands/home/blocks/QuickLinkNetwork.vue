<script setup lang="ts">
import { iconPaths } from "../../../components/shared/iconPaths";

const links = [
  { label: "BLOG", href: "/blog/", icon: iconPaths.blog },
  { label: "PROJECT", href: "/project/", icon: iconPaths.project },
  { label: "FRIENDS", href: "/friends/", icon: iconPaths.friends },
  { label: "ME", href: "/me/", icon: iconPaths.me },
];
</script>

<template>
  <nav class="home-quick-links" aria-label="快捷入口">
    <a
      v-for="link in links"
      :key="link.href"
      :href="link.href"
      :aria-label="link.label"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path :d="link.icon" />
      </svg>
      <span>{{ link.label }}</span>
    </a>
  </nav>
</template>
