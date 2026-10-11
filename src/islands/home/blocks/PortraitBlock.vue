<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";

defineProps<{ model: HomePageModel }>();
</script>

<template>
  <figure class="home-portrait">
    <div class="home-portrait__wood">
      <div class="home-portrait__pane">
        <img
          :src="model.flowerImage"
          alt="花园里捧着花的人像"
          width="1200"
          height="512"
          loading="lazy"
          decoding="async"
        />
        <span class="home-portrait__glass" aria-hidden="true"></span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.home-portrait {
  position: relative;
  margin: 0;
  filter: drop-shadow(0 20px 25px rgba(74, 55, 38, 0.22));
  transform: rotate(-1.2deg);
}

.home-portrait__wood {
  position: absolute;
  inset: 0;
  padding: 16px;
  clip-path: polygon(
    20px 0,
    calc(100% - 20px) 0,
    100% 20px,
    100% calc(100% - 20px),
    calc(100% - 20px) 100%,
    20px 100%,
    0 calc(100% - 20px),
    0 20px
  );
  background:
    repeating-linear-gradient(
      8deg,
      transparent 0 8px,
      rgba(72, 43, 27, 0.1) 9px 10px,
      transparent 11px 18px
    ),
    linear-gradient(135deg, #d6b78b, #9c704e 32%, #78523b 61%, #bd9165);
  box-shadow:
    inset 0 0 0 2px rgba(255, 237, 200, 0.76),
    inset 0 0 0 7px rgba(75, 49, 32, 0.2);
}

.home-portrait__wood::before {
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(255, 223, 177, 0.55);
  clip-path: polygon(
    15px 0,
    calc(100% - 15px) 0,
    100% 15px,
    100% calc(100% - 15px),
    calc(100% - 15px) 100%,
    15px 100%,
    0 calc(100% - 15px),
    0 15px
  );
  content: "";
  pointer-events: none;
}

.home-portrait__pane {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 3px solid #5c4332;
  clip-path: polygon(
    9px 0,
    calc(100% - 9px) 0,
    100% 9px,
    100% calc(100% - 9px),
    calc(100% - 9px) 100%,
    9px 100%,
    0 calc(100% - 9px),
    0 9px
  );
  background: #a88160;
}

.home-portrait__pane img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 66% center;
}

.home-portrait__glass {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      110deg,
      rgba(255, 255, 255, 0.22),
      rgba(255, 255, 255, 0.05) 9%,
      transparent 18% 85%,
      rgba(255, 255, 255, 0.11) 100%
    ),
    radial-gradient(
      ellipse at 18% 0%,
      rgba(255, 255, 255, 0.16),
      transparent 36%
    );
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.52),
    inset 0 0 16px rgba(224, 239, 239, 0.16);
  pointer-events: none;
}
</style>
