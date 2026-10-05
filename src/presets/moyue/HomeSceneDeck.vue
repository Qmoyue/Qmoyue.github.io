<script setup lang="ts">
import type { HomePageModel } from "../../framework/contracts/home";
import type { HomePanel } from "../../islands/home/useHomePanels";
import FallingTags from "../../islands/home/effects/FallingTags.vue";
import HomeBentoGrid from "./HomeBentoGrid.vue";

defineProps<{ model: HomePageModel; panel: HomePanel }>();
</script>

<template>
  <section
    class="home-panel home-second"
    data-home-panel="second"
    aria-label="首页模块"
  >
    <HomeBentoGrid :model="model" />
    <FallingTags :panel="panel" :words="model.fallingWords" />
  </section>
</template>
