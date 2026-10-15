<script setup lang="ts">
import { ref } from "vue";
import type { HomePageModel } from "../../framework/contracts/home";
import HomeOpeningSequence from "../../islands/home/opening/HomeOpeningSequence.vue";
import ScrollRail from "../../components/navigation/ScrollRail.vue";
import { useHomePanels } from "../../islands/home/useHomePanels";
import HomeSceneDeck from "./HomeSceneDeck.vue";

defineProps<{ model: HomePageModel; thumbSrc: string }>();
const root = ref<HTMLElement | null>(null);
const { panel, goToPanel, dragTo } = useHomePanels(root);
</script>

<template>
  <main
    ref="root"
    class="home-root"
    :class="panel === 'second' ? 'is-second' : 'is-first'"
    data-home-root
  >
    <HomeOpeningSequence :model="model" />
    <HomeSceneDeck :model="model" :panel="panel" />
    <ScrollRail
      :thumb-src="thumbSrc"
      :progress="panel === 'second' ? 1 : 0"
      @seek="goToPanel($event >= 0.5 ? 'second' : 'first', true)"
      @drag="dragTo"
    />
  </main>
</template>
