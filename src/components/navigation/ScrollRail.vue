<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import "./scroll-rail.css";

const props = withDefaults(
  defineProps<{ thumbSrc: string; progress: number; step?: number }>(),
  { step: 1 },
);
const emit = defineEmits<{ seek: [ratio: number]; drag: [ratio: number] }>();
const rail = ref<HTMLElement | null>(null);
const track = ref<HTMLButtonElement | null>(null);
const thumb = ref<HTMLImageElement | null>(null);
const dragging = ref(false);
const running = ref(false);
const position = ref(0);
const clamp = (ratio: number) => Math.min(1, Math.max(0, ratio));
const displayedPosition = computed(() =>
  dragging.value ? position.value : clamp(props.progress),
);
let wheelTimer: ReturnType<typeof setTimeout> | undefined;
let grabOffset = 0;

function seekFromPointer(event: PointerEvent): void {
  const rect = track.value?.getBoundingClientRect();
  if (!rect) return;
  position.value = clamp((event.clientY - rect.top - grabOffset) / rect.height);
  emit("drag", position.value);
}

function startDrag(event: PointerEvent): void {
  if (event.button !== 0) return;
  event.preventDefault();
  position.value = clamp(props.progress);
  const rect = track.value?.getBoundingClientRect();
  grabOffset =
    rect && event.target === thumb.value
      ? event.clientY - (rect.top + position.value * rect.height)
      : 0;
  dragging.value = true;
  clearTimeout(wheelTimer);
  running.value = true;
  track.value?.focus({ preventScroll: true });
  rail.value?.setPointerCapture(event.pointerId);
  seekFromPointer(event);
}

function finishDrag(): void {
  if (!dragging.value) return;
  dragging.value = false;
  running.value = false;
  grabOffset = 0;
  emit("seek", position.value);
}

function endDrag(event: PointerEvent): void {
  finishDrag();
  if (rail.value?.hasPointerCapture(event.pointerId)) {
    rail.value.releasePointerCapture(event.pointerId);
  }
}

function onWheel(): void {
  if (dragging.value) return;
  running.value = true;
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => (running.value = false), 420);
}

function onKeydown(event: KeyboardEvent): void {
  let ratio: number;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    ratio =
      displayedPosition.value +
      (event.key === "ArrowDown" ? props.step : -props.step);
  } else if (event.key === "Home" || event.key === "End") {
    ratio = event.key === "End" ? 1 : 0;
  } else return;
  event.preventDefault();
  emit("seek", clamp(ratio));
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
    @lostpointercapture="finishDrag"
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
        ref="thumb"
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
