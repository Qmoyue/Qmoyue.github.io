<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";
import HomeBrand from "./HomeBrand.vue";
import AvatarStage from "./AvatarStage.vue";
import IdentityTerminal from "./IdentityTerminal.vue";
import HomeOpeningCue from "./HomeOpeningCue.vue";

defineProps<{
  model: HomePageModel;
  command: string;
  output: string;
}>();
</script>

<template>
  <section
    class="home-panel home-first"
    data-home-panel="first"
    aria-label="首页介绍"
  >
    <HomeBrand :identity="model.identity" />
    <div class="identity-stage home-identity-stage">
      <AvatarStage :model="model" />
      <IdentityTerminal :model="model" :command="command" :output="output" />
    </div>
    <HomeOpeningCue :text="model.cue" />
  </section>
</template>
