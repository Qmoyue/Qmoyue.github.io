<script setup lang="ts">
import type { HomePageModel } from "../../framework/contracts/home";
import PortraitBlock from "../../islands/home/blocks/PortraitBlock.vue";
import ProfileBlock from "../../islands/home/blocks/ProfileBlock.vue";
import QuoteBlock from "../../islands/home/blocks/QuoteBlock.vue";
import HomeTimeColumn from "../../islands/home/blocks/HomeTimeColumn.vue";
import QuickLinkNetwork from "../../islands/home/blocks/QuickLinkNetwork.vue";

defineProps<{ model: HomePageModel }>();
</script>

<template>
  <div class="home-second-dashboard">
    <PortraitBlock :src="model.flowerImage" />
    <div class="home-center-column">
      <QuoteBlock :src="model.quoteImage" :quote="model.quote" />
      <div class="home-profile-cluster">
        <ProfileBlock
          :identity="model.identity"
          :greeting="model.profileGreeting"
        />
        <QuickLinkNetwork :links="model.links" />
      </div>
    </div>
    <HomeTimeColumn :rendered-at="model.renderedAt" />
  </div>
</template>
