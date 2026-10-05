<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";

defineProps<{ model: HomePageModel }>();
</script>

<template>
  <section
    class="home-bento-card home-profile-widget"
    :aria-label="model.identity.displayName"
  >
    <img
      :src="model.identity.avatar"
      :alt="`${model.identity.displayName} avatar`"
      width="120"
      height="120"
      loading="lazy"
      decoding="async"
    />
    <p>
      <span
        >{{ model.profileGreeting.intro }}
        <strong>{{ model.identity.displayName }}</strong></span
      ><span>{{ model.profileGreeting.outro }}</span>
    </p>
  </section>
</template>
