<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useMatterWorld } from "../useMatterWorld";
import FallingTagChip from "./FallingTagChip.vue";

const props = defineProps<{
  active: boolean;
  words: readonly string[];
}>();
const stage = ref<HTMLElement | null>(null);
const { chips, running, setActive } = useMatterWorld(stage, props.words);

onMounted(() => setActive(props.active));
watch(() => props.active, setActive);
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

<style src="./falling-tags.css"></style>
