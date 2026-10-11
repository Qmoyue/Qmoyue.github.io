<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  name: string;
  avatar?: string;
  reflect?: boolean;
}>();

const failed = ref(false);
const initial = () => props.name.trim().charAt(0).toUpperCase();

watch(
  () => props.avatar,
  () => {
    failed.value = false;
  },
);
</script>

<template>
  <span
    class="friend-portrait"
    :class="{ 'has-reflection': reflect }"
    aria-hidden="true"
  >
    <span class="portrait-face">
      <span class="portrait-initial">{{ initial() }}</span>
      <img
        v-if="avatar && !failed"
        :src="avatar"
        alt=""
        width="360"
        height="360"
        loading="eager"
        decoding="async"
        referrerpolicy="no-referrer"
        @error="failed = true"
      />
    </span>
    <span v-if="reflect" class="portrait-reflection">
      <span class="portrait-initial">{{ initial() }}</span>
      <img v-if="avatar && !failed" :src="avatar" alt="" aria-hidden="true" />
    </span>
  </span>
</template>

<style scoped>
.friend-portrait {
  position: relative;
  display: block;
  width: var(--portrait-size);
  height: var(--portrait-size);
  flex: none;
}

.friend-portrait.has-reflection {
  height: calc(var(--portrait-size) + var(--reflection-height));
}

.friend-portrait.has-reflection::after {
  position: absolute;
  z-index: -1;
  top: calc(var(--portrait-size) + 5px);
  left: 12%;
  width: 76%;
  height: 22px;
  border-radius: 50%;
  background: rgba(101, 77, 81, 0.2);
  content: "";
  filter: blur(13px);
}

.portrait-face {
  position: relative;
  display: grid;
  width: var(--portrait-size);
  height: var(--portrait-size);
  overflow: hidden;
  place-items: center;
  border: clamp(5px, 0.7vw, 9px) solid rgba(255, 253, 249, 0.96);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 20%, #fff5e9, #efdde0 60%, #ddd7e5);
  box-shadow:
    0 22px 44px rgba(107, 77, 84, 0.18),
    0 4px 12px rgba(92, 83, 102, 0.1),
    inset 0 0 0 1px rgba(162, 126, 132, 0.18);
}

.portrait-initial {
  color: #ad8495;
  font-family: Georgia, "Times New Roman", serif;
  font-size: calc(var(--portrait-size) * 0.46);
  font-style: italic;
  line-height: 1;
  text-shadow: 0 3px 0 rgba(255, 255, 255, 0.65);
}

.portrait-face img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.portrait-reflection {
  position: absolute;
  top: calc(var(--portrait-size) + 10px);
  left: 13%;
  display: grid;
  width: 74%;
  height: calc(var(--reflection-height) - 10px);
  overflow: hidden;
  place-items: start center;
  border-radius: 50%;
  opacity: 0.19;
  filter: blur(2.5px);
  mask-image: radial-gradient(
    ellipse 68% 95% at 50% 0%,
    #000 4%,
    transparent 75%
  );
}

.portrait-reflection img,
.portrait-reflection .portrait-initial {
  position: absolute;
  top: 0;
  width: 100%;
  height: auto;
  transform: scaleY(-1);
  transform-origin: center center;
}

.portrait-reflection img {
  aspect-ratio: 1;
  object-fit: cover;
}

.portrait-reflection .portrait-initial {
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  font-size: calc(var(--portrait-size) * 0.4);
}
</style>
