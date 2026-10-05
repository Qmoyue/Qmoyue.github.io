<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

defineProps<{ thumbSrc: string }>();

const rail = ref<HTMLElement | null>(null);
const track = ref<HTMLButtonElement | null>(null);
const progress = ref(0);
const dragging = ref(false);
const running = ref(false);
let wheelRunTimer = 0;

function maxScroll() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

function updateProgress() {
  const max = maxScroll();
  progress.value =
    max === 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
}

function seek(ratio: number) {
  const next = Math.min(1, Math.max(0, ratio));
  window.scrollTo({ top: maxScroll() * next, behavior: "smooth" });
  progress.value = next;
}

function seekFromPointer(event: PointerEvent) {
  const rect = track.value?.getBoundingClientRect();
  if (!rect) return;
  seek((event.clientY - rect.top) / rect.height);
}

function startDrag(event: PointerEvent) {
  if (event.button !== 0) return;
  event.preventDefault();
  dragging.value = true;
  running.value = true;
  rail.value?.setPointerCapture(event.pointerId);
  seekFromPointer(event);
}

function moveDrag(event: PointerEvent) {
  if (dragging.value) seekFromPointer(event);
}

function endDrag(event: PointerEvent) {
  if (!dragging.value) return;
  dragging.value = false;
  running.value = false;
  if (rail.value?.hasPointerCapture(event.pointerId)) {
    rail.value.releasePointerCapture(event.pointerId);
  }
  updateProgress();
}

function losePointer() {
  dragging.value = false;
  running.value = false;
}

function onWheel() {
  if (dragging.value) return;
  running.value = true;
  window.clearTimeout(wheelRunTimer);
  wheelRunTimer = window.setTimeout(() => (running.value = false), 420);
}

function onKeydown(event: KeyboardEvent) {
  const step = window.innerHeight / Math.max(maxScroll(), 1);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    seek(progress.value + (event.key === "ArrowDown" ? step : -step));
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    seek(event.key === "End" ? 1 : 0);
  }
}

onMounted(() => {
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  window.addEventListener("wheel", onWheel, { passive: true });
  updateProgress();
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateProgress);
  window.removeEventListener("resize", updateProgress);
  window.removeEventListener("wheel", onWheel);
  window.clearTimeout(wheelRunTimer);
});
</script>

<template>
  <div
    ref="rail"
    class="scroll-rail"
    :class="{ 'is-dragging': dragging, 'is-running': running }"
    :style="{ '--scroll-progress': `${progress * 100}%` }"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @lostpointercapture="losePointer"
  >
    <button
      ref="track"
      class="scroll-rail-track"
      type="button"
      role="slider"
      aria-label="页面滚动进度"
      aria-orientation="vertical"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(progress * 100)"
      @keydown="onKeydown"
    >
      <span class="scroll-rail-fill"></span>
      <img
        class="scroll-rail-thumb"
        :src="thumbSrc"
        alt=""
        width="34"
        height="34"
        loading="eager"
      />
    </button>
  </div>
</template>
