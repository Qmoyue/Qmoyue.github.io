<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { HomePanel } from "./useHomePanels";

const props = defineProps<{ thumbSrc: string; panel: HomePanel }>();
const emit = defineEmits<{
  seek: [panel: HomePanel, dragging: boolean];
  drag: [ratio: number];
}>();
const rail = ref<HTMLElement | null>(null);
const track = ref<HTMLButtonElement | null>(null);
const dragging = ref(false);
const running = ref(false);
const position = ref(0);
const displayedPosition = computed(() =>
  dragging.value ? position.value : props.panel === "second" ? 1 : 0,
);
let wheelTimer: ReturnType<typeof setTimeout> | undefined;
let grabOffset = 0;

function seekFromPointer(event: PointerEvent): void {
  const rect = track.value?.getBoundingClientRect();
  if (!rect) return;
  const ratio = Math.min(
    1,
    Math.max(0, (event.clientY - rect.top - grabOffset) / rect.height),
  );
  position.value = ratio;
  emit("drag", ratio);
}

function startDrag(event: PointerEvent): void {
  if (event.button !== 0) return;
  event.preventDefault();
  position.value = props.panel === "second" ? 1 : 0;
  const rect = track.value?.getBoundingClientRect();
  grabOffset =
    rect && event.target === rail.value?.querySelector(".scroll-rail-thumb")
      ? event.clientY - (rect.top + position.value * rect.height)
      : 0;
  dragging.value = true;
  clearTimeout(wheelTimer);
  running.value = true;
  rail.value?.setPointerCapture(event.pointerId);
  seekFromPointer(event);
}

function endDrag(event: PointerEvent): void {
  if (!dragging.value) return;
  dragging.value = false;
  running.value = false;
  grabOffset = 0;
  emit("seek", position.value >= 0.5 ? "second" : "first", true);
  if (rail.value?.hasPointerCapture(event.pointerId)) {
    rail.value.releasePointerCapture(event.pointerId);
  }
}

function loseDrag(): void {
  if (dragging.value) {
    emit("seek", position.value >= 0.5 ? "second" : "first", true);
  }
  dragging.value = false;
  running.value = false;
  grabOffset = 0;
}

function onWheel(): void {
  if (dragging.value) return;
  running.value = true;
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => (running.value = false), 420);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    emit("seek", event.key === "ArrowDown" ? "second" : "first", true);
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    emit("seek", event.key === "End" ? "second" : "first", true);
  }
}

onMounted(() => window.addEventListener("wheel", onWheel, { passive: true }));
onUnmounted(() => {
  window.removeEventListener("wheel", onWheel);
  clearTimeout(wheelTimer);
});
</script>

<template>
  <div
    ref="rail"
    class="scroll-rail"
    :class="{ 'is-dragging': dragging, 'is-running': running }"
    :style="{ '--scroll-progress': `${displayedPosition * 100}%` }"
    data-scroll-rail
    @pointerdown="startDrag"
    @pointermove="dragging && seekFromPointer($event)"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @lostpointercapture="loseDrag"
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
      :aria-valuenow="Math.round(displayedPosition * 100)"
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
