<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";

defineProps<{ model: HomePageModel }>();
</script>

<template>
  <div class="home-bento-card home-flower-banner" aria-hidden="true">
    <img
      :src="model.flowerImage"
      alt=""
      width="760"
      height="280"
      loading="eager"
      decoding="async"
    />
  </div>
</template>
