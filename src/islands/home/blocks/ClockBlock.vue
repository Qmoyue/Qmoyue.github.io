<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent } from "../../../components/ui/card";

const props = defineProps<{ now: Date }>();
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
  const date = new Date(props.now.getTime() + 8 * 60 * 60 * 1000);
  return `${date.getUTCFullYear()}年${pad(date.getUTCMonth() + 1)}月${pad(date.getUTCDate())}日${weekdays[date.getUTCDay()]}`;
});
const timeLabel = computed(() =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(props.now),
);
</script>

<template>
  <Card as="section" class="home-clock-widget" aria-label="当前时间">
    <CardContent>
      <p class="clock-label">CLOCK</p>
      <p class="clock-date" data-clock-date>{{ dateLabel }}</p>
      <p class="clock-time" data-clock-time>{{ timeLabel }}</p>
    </CardContent>
  </Card>
</template>

<style src="./clock.css"></style>
