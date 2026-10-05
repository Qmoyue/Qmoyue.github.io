<script setup lang="ts">
import type { FallingChip } from "../useMatterWorld";

defineProps<{ chip: FallingChip }>();
</script>

<template>
  <span
    class="falling-item"
    :class="[
      `is-${chip.color}`,
      { 'is-wide': chip.wide, 'is-physics-fading': chip.fading },
    ]"
    :style="{
      width: `${chip.width}px`,
      height: `${chip.height}px`,
      opacity: chip.opacity,
      transform: `translate3d(${chip.x}px, ${chip.y}px, 0) translate(-50%, -50%) rotate(${chip.angle}rad)`,
    }"
  >
    <b>{{ chip.text }}</b>
  </span>
</template>
