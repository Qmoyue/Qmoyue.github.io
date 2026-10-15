<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import ClockBlock from "./ClockBlock.vue";
import CalendarBlock from "./CalendarBlock.vue";

const props = defineProps<{ renderedAt: string }>();
const now = ref(new Date(props.renderedAt));
let interval: ReturnType<typeof setInterval>;

onMounted(() => {
  now.value = new Date();
  interval = setInterval(() => (now.value = new Date()), 1000);
});
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div class="home-time-column">
    <ClockBlock :now="now" />
    <CalendarBlock :now="now" />
  </div>
</template>

<style src="./time-column.css"></style>
