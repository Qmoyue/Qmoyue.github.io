<script setup lang="ts">
import type { HomePageModel } from "../../../framework/contracts/home";

defineProps<{
  terminal: HomePageModel["terminal"];
  command: string;
  output: string;
}>();
</script>

<template>
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
</template>
