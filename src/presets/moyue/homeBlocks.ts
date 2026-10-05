import type { Component } from "vue";
import type { HomeBlockArea } from "../../framework/contracts/home";
import LatestPostBlock from "../../islands/home/blocks/LatestPostBlock.vue";
import FlowerBannerBlock from "../../islands/home/blocks/FlowerBannerBlock.vue";
import ProfileBlock from "../../islands/home/blocks/ProfileBlock.vue";
import ClockBlock from "../../islands/home/blocks/ClockBlock.vue";
import CalendarBlock from "../../islands/home/blocks/CalendarBlock.vue";
import QuoteBlock from "../../islands/home/blocks/QuoteBlock.vue";

export interface HomeBlockDefinition {
  id: HomeBlockArea;
  area: HomeBlockArea;
  component: Component;
}

export const homeBlocks = [
  { id: "latest", area: "latest", component: LatestPostBlock },
  { id: "flower", area: "flower", component: FlowerBannerBlock },
  { id: "profile", area: "profile", component: ProfileBlock },
  { id: "clock", area: "clock", component: ClockBlock },
  { id: "calendar", area: "calendar", component: CalendarBlock },
  { id: "quote", area: "quote", component: QuoteBlock },
] satisfies readonly HomeBlockDefinition[];
