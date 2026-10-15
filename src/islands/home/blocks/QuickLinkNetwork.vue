<script setup lang="ts">
import { iconPaths } from "../../../components/shared/iconPaths";
import type { NavigationItem } from "../../../framework/contracts/config";

defineProps<{ links: readonly NavigationItem[] }>();
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
        <path :d="iconPaths[link.icon]" />
      </svg>
      <span>{{ link.label }}</span>
    </a>
  </nav>
</template>

<style src="./quick-links.css"></style>
