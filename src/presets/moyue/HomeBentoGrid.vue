<script setup lang="ts">
import type { HomePageModel } from "../../framework/contracts/home";
import { homeBlocks } from "./homeBlocks";

defineProps<{ model: HomePageModel }>();
</script>

<template>
  <div class="home-second-dashboard">
    <component
      :is="block.component"
      v-for="block in homeBlocks"
      :key="block.id"
      :model="model"
    />
  </div>
</template>
