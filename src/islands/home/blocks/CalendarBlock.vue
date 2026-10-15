<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ now: Date }>();
// Use the same calendar day during static rendering and browser hydration.
const today = computed(
  () => new Date(props.now.getTime() + 8 * 60 * 60 * 1000),
);
const pad = (value: number) => String(value).padStart(2, "0");
const monthLabel = computed(
  () =>
    `${today.value.getUTCFullYear()} / ${pad(today.value.getUTCMonth() + 1)}`,
);
const todayLabel = computed(
  () =>
    `${pad(today.value.getUTCMonth() + 1)}.${pad(today.value.getUTCDate())}`,
);
const days = computed(() => {
  const year = today.value.getUTCFullYear();
  const month = today.value.getUTCMonth();
  const blanks = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [
    ...Array.from({ length: blanks }, () => ({ day: 0, weekend: false })),
    ...Array.from({ length: count }, (_, index) => {
      const day = index + 1;
      const weekday = new Date(Date.UTC(year, month, day)).getUTCDay();
      return { day, weekend: weekday === 0 || weekday === 6 };
    }),
  ];
});
</script>

<template>
  <section class="home-calendar-widget" aria-label="日历">
    <div class="home-calendar-head">
      <div>
        <p class="home-calendar-label">CALENDAR</p>
        <time data-calendar-month>{{ monthLabel }}</time>
      </div>
      <span data-calendar-today>{{ todayLabel }}</span>
    </div>
    <div>
      <div class="home-calendar-weekdays" aria-hidden="true">
        <span>一</span><span>二</span><span>三</span><span>四</span
        ><span>五</span><span>六</span><span>日</span>
      </div>
      <div class="home-calendar-days" data-calendar-days>
        <span
          v-for="(item, index) in days"
          :key="index"
          :class="{
            'is-blank': item.day === 0,
            'is-today': item.day === today.getUTCDate(),
            'is-weekend': item.weekend,
          }"
          :aria-current="
            item.day && item.day === today.getUTCDate() ? 'date' : undefined
          "
          >{{ item.day || "" }}</span
        >
      </div>
    </div>
  </section>
</template>

<style src="./calendar.css"></style>
