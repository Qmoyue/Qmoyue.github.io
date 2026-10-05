<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { HomePanel } from "../useHomePanels";
import { useMatterWorld } from "../useMatterWorld";
import FallingTagChip from "./FallingTagChip.vue";

const props = defineProps<{
  panel: HomePanel;
  words: readonly string[];
  seed?: number;
}>();
const stage = ref<HTMLElement | null>(null);
const { chips, running, setActive } = useMatterWorld(
  stage,
  props.words,
  props.seed,
);

onMounted(() => setActive(props.panel === "second"));
watch(
  () => props.panel,
  (panel) => setActive(panel === "second"),
);
</script>

<template>
  <div
    ref="stage"
    class="falling-stage"
    :class="{ 'is-physics-running': running }"
    data-falling-stage
    aria-hidden="true"
  >
    <FallingTagChip v-for="chip in chips" :key="chip.id" :chip="chip" />
  </div>
</template>
