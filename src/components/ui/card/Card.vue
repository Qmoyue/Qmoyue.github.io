<script setup lang="ts">
withDefaults(defineProps<{ as?: string }>(), { as: "div" });
</script>

<template>
  <component
    :is="as"
    class="rounded-xl border border-line bg-surface text-ink shadow-sm"
  >
    <slot />
  </component>
</template>
