<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { HomePageModel } from "../../../framework/contracts/home";

const props = defineProps<{ model: HomePageModel }>();
const now = ref(new Date(props.model.renderedAt));
const pad = (value: number) => String(value).padStart(2, "0");
const weekdays = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
];
const dateLabel = computed(() => {
  const date = now.value;
  return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日${weekdays[date.getDay()]}`;
});
const timeLabel = computed(
  () => `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}`,
);
let interval: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  now.value = new Date();
  interval = setInterval(() => (now.value = new Date()), 1000);
});
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <section class="home-bento-card home-clock-widget" aria-label="当前时间">
    <p class="clock-date" data-clock-date>{{ dateLabel }}</p>
    <p class="clock-time" data-clock-time>{{ timeLabel }}</p>
  </section>
</template>
