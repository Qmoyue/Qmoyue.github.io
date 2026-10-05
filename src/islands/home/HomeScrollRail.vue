<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { HomePanel } from "./useHomePanels";

defineProps<{ thumbSrc: string; panel: HomePanel }>();
const emit = defineEmits<{ seek: [panel: HomePanel, dragging: boolean] }>();
const rail = ref<HTMLElement | null>(null);
const track = ref<HTMLButtonElement | null>(null);
const dragging = ref(false);
const running = ref(false);
let wheelTimer: ReturnType<typeof setTimeout> | undefined;

function seekFromPointer(event: PointerEvent): void {
  const rect = track.value?.getBoundingClientRect();
  if (!rect) return;
  const ratio = Math.min(
    1,
    Math.max(0, (event.clientY - rect.top) / rect.height),
  );
  emit("seek", ratio > 0.45 ? "second" : "first", dragging.value);
}

function startDrag(event: PointerEvent): void {
  if (event.button !== 0) return;
  event.preventDefault();
  dragging.value = true;
  running.value = true;
  rail.value?.setPointerCapture(event.pointerId);
  seekFromPointer(event);
}

function endDrag(event: PointerEvent): void {
  if (!dragging.value) return;
  dragging.value = false;
  running.value = false;
  if (rail.value?.hasPointerCapture(event.pointerId)) {
    rail.value.releasePointerCapture(event.pointerId);
  }
}

function loseDrag(): void {
  dragging.value = false;
  running.value = false;
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
    :style="{ '--scroll-progress': panel === 'second' ? '100%' : '0%' }"
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
      :aria-valuenow="panel === 'second' ? 100 : 0"
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
