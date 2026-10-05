<script setup lang="ts">
import { ref } from "vue";

defineProps<{ label: string }>();
const count = ref(0);
</script>

<template>
  <button
    class="rounded-full border border-line bg-surface px-3 py-2 font-body text-ink"
    type="button"
    @click="count += 1"
  >
    {{ label }} {{ count }}
  </button>
</template>
