<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";
import TerminalChrome from "./TerminalChrome.vue";
import TerminalTranscript from "./TerminalTranscript.vue";

defineProps<{
  model: HomePageModel;
  command: string;
  output: string;
}>();
</script>

<template>
  <section class="terminal-ubuntu" aria-label="terminal identity">
    <TerminalChrome :host="model.terminal.host" :path="model.terminal.path" />
    <TerminalTranscript
      :terminal="model.terminal"
      :command="command"
      :output="output"
    />
    <div class="terminal-links">
      <a
        class="github-pill"
        :href="model.identity.githubUrl"
        aria-label="GitHub"
      >
        <span class="github-pill-icon"
          ><img
            src="/images/github-mark.svg"
            alt=""
            width="24"
            height="24"
            loading="lazy"
        /></span>
      </a>
    </div>
  </section>
</template>
