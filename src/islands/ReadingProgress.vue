<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import ScrollRail from "../components/navigation/ScrollRail.vue";

defineProps<{ thumbSrc: string }>();
const progress = ref(0);
const step = ref(1);
let observer: ResizeObserver;

function maxScroll(): number {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

function updateProgress(): void {
  const max = maxScroll();
  progress.value =
    max === 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
  step.value = max === 0 ? 1 : window.innerHeight / max;
}

function seek(ratio: number, behavior: ScrollBehavior = "smooth"): void {
  const next = Math.min(1, Math.max(0, ratio));
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  window.scrollTo({
    top: maxScroll() * next,
    behavior: reducedMotion ? "instant" : behavior,
  });
  progress.value = next;
}

onMounted(() => {
  observer = new ResizeObserver(updateProgress);
  observer.observe(document.body);
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
});

onUnmounted(() => {
  observer.disconnect();
  window.removeEventListener("scroll", updateProgress);
  window.removeEventListener("resize", updateProgress);
});
</script>

<template>
  <ScrollRail
    :thumb-src="thumbSrc"
    :progress="progress"
    :step="step"
    @seek="seek"
    @drag="seek($event, 'instant')"
  />
</template>
