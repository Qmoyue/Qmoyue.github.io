<script setup lang="ts">
import { nextTick, onUnmounted, ref } from "vue";
import type { HomePageModel } from "../../../framework/contracts/home";
import AvatarFrame from "./AvatarFrame.vue";
import AvatarPortrait from "./AvatarPortrait.vue";
import GuitarInteraction from "./GuitarInteraction.vue";
import AvatarSpeech from "./AvatarSpeech.vue";

defineProps<{ model: HomePageModel }>();
const strumming = ref(false);
const speaking = ref(false);
let guitarTimer: ReturnType<typeof setTimeout> | undefined;
let speechTimer: ReturnType<typeof setTimeout> | undefined;

async function strum(): Promise<void> {
  clearTimeout(guitarTimer);
  clearTimeout(speechTimer);
  strumming.value = false;
  speaking.value = false;
  await nextTick();
  strumming.value = true;
  speaking.value = true;
  guitarTimer = setTimeout(() => (strumming.value = false), 720);
  speechTimer = setTimeout(() => (speaking.value = false), 2600);
}

onUnmounted(() => {
  clearTimeout(guitarTimer);
  clearTimeout(speechTimer);
});
</script>

<template>
  <AvatarFrame @strum="strum">
    <AvatarPortrait
      :src="model.identity.avatar"
      :name="model.identity.displayName"
    />
    <GuitarInteraction :src="model.guitarImage" :strumming="strumming" />
    <AvatarSpeech :text="model.avatarSpeech" :speaking="speaking" />
  </AvatarFrame>
</template>
