<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import type { HomePageModel } from "../../framework/contracts/home";
import HomeOpeningSequence from "../../islands/home/opening/HomeOpeningSequence.vue";
import HomeScrollRail from "../../islands/home/HomeScrollRail.vue";
import { useHomePanels } from "../../islands/home/useHomePanels";
import { useOpeningTimeline } from "../../islands/home/useOpeningTimeline";
import { useTerminalSequence } from "../../islands/home/useTerminalSequence";
import HomeSceneDeck from "./HomeSceneDeck.vue";

const props = defineProps<{ model: HomePageModel; thumbSrc: string }>();
const root = ref<HTMLElement | null>(null);
const { panel, goToPanel } = useHomePanels(root);
const timeline = useOpeningTimeline();
const terminal = useTerminalSequence(props.model.terminal);
let reducedMotion = false;

watch(timeline.stage, (stage) => {
  if (stage === "terminalContent" && !reducedMotion) terminal.start();
});

onMounted(() => {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  terminal.reset(reducedMotion);
  timeline.start(reducedMotion);
});

onUnmounted(() => {
  timeline.cancel();
  terminal.cancel();
});
</script>

<template>
  <main
    ref="root"
    class="home-root"
    :class="panel === 'second' ? 'is-second' : 'is-first'"
    :data-opening-stage="timeline.stage.value"
    data-home-root
  >
    <HomeOpeningSequence
      :model="model"
      :command="terminal.command.value"
      :output="terminal.output.value"
    />
    <HomeSceneDeck :model="model" :panel="panel" />
    <HomeScrollRail :thumb-src="thumbSrc" :panel="panel" @seek="goToPanel" />
  </main>
</template>
