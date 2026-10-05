<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";

defineProps<{ model: HomePageModel }>();
</script>

<template>
  <section class="home-bento-card home-quote-widget" aria-label="格言">
    <p>{{ model.quote[0] }}</p>
    <p>{{ model.quote[1] }}</p>
  </section>
</template>
