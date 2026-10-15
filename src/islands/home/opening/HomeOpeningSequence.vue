<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import type { HomePageModel } from "../../../framework/contracts/home";
import { useOpeningTimeline } from "../useOpeningTimeline";
import { useTerminalSequence } from "../useTerminalSequence";
import AvatarStage from "./AvatarStage.vue";
import IdentityTerminal from "./IdentityTerminal.vue";

const props = defineProps<{ model: HomePageModel }>();
const timeline = useOpeningTimeline();
const terminal = useTerminalSequence(props.model.terminal);
let motion: MediaQueryList;

watch(timeline.stage, (stage) => {
  if (stage === "terminalContent" && !motion.matches) terminal.start();
});

function onMotionChange(): void {
  if (!motion.matches) return;
  terminal.reset(true);
  timeline.start(true);
}

onMounted(() => {
  motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  terminal.reset(motion.matches);
  timeline.start(motion.matches);
  motion.addEventListener("change", onMotionChange);
});

onUnmounted(() => {
  motion.removeEventListener("change", onMotionChange);
  timeline.cancel();
  terminal.cancel();
});
</script>

<template>
  <section
    class="home-panel home-first"
    data-home-panel="first"
    :data-opening-stage="timeline.stage.value"
    aria-label="首页介绍"
  >
    <div class="home-hero-brand">
      <p>{{ model.identity.subtitle }}</p>
      <h1>{{ model.identity.displayName }}</h1>
    </div>
    <div class="home-identity-stage">
      <AvatarStage
        :avatar="model.identity.avatar"
        :frame="model.avatarFrameImage"
        :speech="model.avatarSpeech"
      />
      <IdentityTerminal
        :terminal="model.terminal"
        :github-url="model.identity.githubUrl"
        :command="terminal.command.value"
        :output="terminal.output.value"
      />
    </div>
    <p class="home-cue">{{ model.cue }}</p>
  </section>
</template>

<style src="./opening.css"></style>
