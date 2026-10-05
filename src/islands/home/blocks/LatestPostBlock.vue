<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";

defineProps<{ model: HomePageModel }>();
</script>

<template>
  <section class="home-bento-card home-latest-panel" aria-label="最新文章">
    <a class="home-latest-card is-primary" :href="model.latest.href">
      <span class="home-latest-image">
        <img
          :src="model.latest.coverSrc"
          :alt="model.latest.coverAlt"
          width="320"
          height="390"
          loading="eager"
          decoding="async"
        />
      </span>
      <span class="home-latest-copy">
        <time :datetime="model.latest.pubDate">{{
          model.latest.dateLabel
        }}</time>
        <h3>{{ model.latest.title }}</h3>
        <p>{{ model.latest.description }}</p>
        <span class="home-latest-meta">
          <span v-for="tag in model.latest.tags" :key="tag">#{{ tag }}</span>
          <small>{{ model.latest.wordsLabel }}</small>
        </span>
      </span>
    </a>
  </section>
</template>
