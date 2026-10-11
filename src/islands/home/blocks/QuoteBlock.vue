<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";

defineProps<{ model: HomePageModel }>();
</script>

<template>
  <section class="home-quote-widget" aria-label="签名">
    <img
      class="home-quote-widget__portrait"
      :src="model.quoteImage"
      alt="银蓝色短发、红色眼睛的人物"
      width="424"
      height="346"
      loading="lazy"
      decoding="async"
    />
    <blockquote>
      <p>{{ model.quote[0] }}</p>
      <p>{{ model.quote[1] }}</p>
    </blockquote>
  </section>
</template>

<style scoped>
.home-quote-widget {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: 172px;
  align-items: center;
  overflow: hidden;
  padding: 22px 23px 22px 162px;
  border: 1px solid rgba(190, 201, 222, 0.76);
  border-radius: 25px;
  background: linear-gradient(105deg, #dce5f2 4%, #f2f1f5 44%, #fffaf6 100%);
  box-shadow: 0 18px 40px rgba(95, 108, 139, 0.16);
  transform: rotate(1deg);
}

.home-quote-widget__portrait {
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: 205px;
  height: 100%;
  object-fit: cover;
  object-position: 55% center;
  mask-image: linear-gradient(to right, #000 0 72%, transparent 100%);
  transform: scale(1.045);
}

.home-quote-widget blockquote {
  width: 100%;
  margin: 0;
  color: #4e6079;
  font-family: "KaiTi", "STKaiti", serif;
  font-size: clamp(1.13rem, 1.6vw, 1.4rem);
  font-weight: 700;
  line-height: 1.52;
  text-shadow: 0 1px rgba(255, 255, 255, 0.7);
}

.home-quote-widget p {
  margin: 0;
  white-space: nowrap;
}

.home-quote-widget p + p {
  text-align: right;
}

@media (max-width: 800px) {
  .home-quote-widget {
    min-height: 142px;
    padding: 18px 13px 18px 113px;
  }

  .home-quote-widget__portrait {
    width: 145px;
  }

  .home-quote-widget blockquote {
    font-size: clamp(0.9rem, 4.2vw, 1.12rem);
  }
}
</style>
