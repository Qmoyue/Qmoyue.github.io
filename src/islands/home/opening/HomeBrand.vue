<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";

defineProps<{ identity: HomePageModel["identity"] }>();
</script>

<template>
  <div class="home-hero-brand">
    <p>{{ identity.subtitle }}</p>
    <h1>{{ identity.displayName }}</h1>
  </div>
</template>
