<script setup lang="ts">
import type { HomePageModel } from "../../framework/contracts/home";
import PortraitBlock from "../../islands/home/blocks/PortraitBlock.vue";
import ProfileBlock from "../../islands/home/blocks/ProfileBlock.vue";
import QuoteBlock from "../../islands/home/blocks/QuoteBlock.vue";
import ClockBlock from "../../islands/home/blocks/ClockBlock.vue";
import CalendarBlock from "../../islands/home/blocks/CalendarBlock.vue";
import QuickLinkNetwork from "../../islands/home/blocks/QuickLinkNetwork.vue";

defineProps<{ model: HomePageModel }>();
</script>

<template>
  <div class="home-second-dashboard">
    <PortraitBlock :model="model" />
    <div class="home-center-column">
      <QuoteBlock :model="model" />
      <div class="home-profile-cluster">
        <ProfileBlock :model="model" />
        <QuickLinkNetwork />
      </div>
    </div>
    <div class="home-time-column">
      <ClockBlock :model="model" />
      <CalendarBlock :model="model" />
    </div>
  </div>
</template>
