<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import type { HomePageModel } from "../../../framework/contracts/home";
import AvatarFrame from "./AvatarFrame.vue";
import AvatarPortrait from "./AvatarPortrait.vue";
import AvatarSpeech from "./AvatarSpeech.vue";

defineProps<{ model: HomePageModel }>();
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
      <AvatarPortrait :src="model.identity.avatar" />
      <AvatarFrame :src="model.avatarFrameImage" />
    </span>
    <AvatarSpeech
      :key="speechKey"
      :text="model.avatarSpeech"
      :speaking="speaking"
    />
  </button>
</template>
