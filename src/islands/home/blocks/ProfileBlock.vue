<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";

defineProps<{
  identity: Pick<HomePageModel["identity"], "avatar" | "displayName">;
  greeting: HomePageModel["profileGreeting"];
}>();
</script>

<template>
  <section class="home-profile-widget" :aria-label="identity.displayName">
    <img
      :src="identity.avatar"
      :alt="`${identity.displayName} avatar`"
      width="120"
      height="120"
      loading="lazy"
      decoding="async"
    />
    <p>
      <span
        >{{ greeting.intro }} <strong>{{ identity.displayName }}</strong></span
      ><span>{{ greeting.outro }}</span>
    </p>
  </section>
</template>

<style src="./profile.css"></style>
