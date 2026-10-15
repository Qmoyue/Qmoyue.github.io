<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";

defineProps<{
  terminal: HomePageModel["terminal"];
  githubUrl: string;
  command: string;
  output: string;
}>();
</script>

<template>
  <section class="terminal-ubuntu" aria-label="terminal identity">
    <div class="terminal-topbar" aria-hidden="true">
      <span class="terminal-lights"><i></i><i></i><i></i></span>
      <span class="terminal-window-title"
        >{{ terminal.host }}:{{ terminal.path }}</span
      >
    </div>
    <div class="terminal-screen">
      <p class="terminal-line terminal-command-line">
        <span class="terminal-prompt">
          <span class="terminal-prompt-host">{{ terminal.host }}</span
          >:<span class="terminal-prompt-path">{{ terminal.path }}</span
          >$
        </span>
        <span class="terminal-entry">
          <span class="terminal-command" data-terminal-command>{{
            command
          }}</span>
          <span class="terminal-caret" aria-hidden="true"></span>
        </span>
      </p>
      <p
        class="terminal-line terminal-output"
        :class="{ 'is-visible': output }"
        data-terminal-output
      >
        {{ output }}
      </p>
    </div>
    <div class="terminal-links">
      <a class="github-pill" :href="githubUrl" aria-label="GitHub">
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

<style src="./terminal.css"></style>
