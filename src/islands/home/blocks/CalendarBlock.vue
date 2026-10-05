<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { HomePageModel } from "../../../framework/contracts/home";

const props = defineProps<{ model: HomePageModel }>();
const now = ref(new Date(props.model.renderedAt));
const pad = (value: number) => String(value).padStart(2, "0");
const monthLabel = computed(
  () => `${now.value.getFullYear()} / ${pad(now.value.getMonth() + 1)}`,
);
const todayLabel = computed(
  () => `${pad(now.value.getMonth() + 1)}.${pad(now.value.getDate())}`,
);
const days = computed(() => {
  const year = now.value.getFullYear();
  const month = now.value.getMonth();
  const blanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: blanks }, () => ({ day: 0, weekend: false })),
    ...Array.from({ length: count }, (_, index) => {
      const day = index + 1;
      const weekday = new Date(year, month, day).getDay();
      return { day, weekend: weekday === 0 || weekday === 6 };
    }),
  ];
});
let interval: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  now.value = new Date();
  interval = setInterval(() => (now.value = new Date()), 60_000);
});
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <section class="home-bento-card home-calendar-widget" aria-label="日历">
    <div class="home-bento-head is-small">
      <div>
        <p class="home-bento-label">CALENDAR</p>
        <time data-calendar-month>{{ monthLabel }}</time>
      </div>
      <span data-calendar-today>{{ todayLabel }}</span>
    </div>
    <div class="home-calendar-weekdays" aria-hidden="true">
      <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span
      ><span>六</span><span>日</span>
    </div>
    <div class="home-calendar-days" data-calendar-days>
      <span
        v-for="(item, index) in days"
        :key="index"
        :class="{
          'is-blank': item.day === 0,
          'is-today': item.day === now.getDate(),
          'is-weekend': item.weekend,
        }"
        :aria-current="
          item.day && item.day === now.getDate() ? 'date' : undefined
        "
        >{{ item.day || "" }}</span
      >
    </div>
  </section>
</template>
