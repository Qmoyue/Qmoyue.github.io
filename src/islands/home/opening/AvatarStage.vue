<script setup lang="ts">
import { onUnmounted, ref } from "vue";

defineProps<{ avatar: string; frame: string; speech: string }>();
const speaking = ref(false);
const speechKey = ref(0);
let speechTimer: ReturnType<typeof setTimeout> | undefined;

function showSpeech(): void {
  clearTimeout(speechTimer);
  speechKey.value += 1;
  speaking.value = true;
  speechTimer = setTimeout(() => (speaking.value = false), 1800);
}

onUnmounted(() => {
  clearTimeout(speechTimer);
});
</script>

<template>
  <button
    class="hero-avatar"
    type="button"
    aria-label="显示头像留言"
    @click="showSpeech"
  >
    <span class="hero-avatar-artwork">
      <img
        class="hero-avatar-portrait"
        :src="avatar"
        alt=""
        width="1676"
        height="1676"
        loading="eager"
        decoding="async"
      />
      <img
        class="hero-avatar-frame"
        :src="frame"
        alt=""
        width="1254"
        height="1254"
        loading="eager"
        decoding="async"
      />
    </span>
    <span
      :key="speechKey"
      class="avatar-speech"
      :class="{ 'is-speaking': speaking }"
      data-avatar-speech
      aria-hidden="true"
      >{{ speech }}</span
    >
  </button>
</template>

<style src="./avatar.css"></style>
