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
    <p class="terminal-path">{{ terminal.path }}</p>
    <p class="terminal-line">
      <span class="terminal-prompt">$</span>
      <span class="terminal-command" data-terminal-command>{{ command }}</span
      ><span class="terminal-caret" aria-hidden="true"></span>
    </p>
    <p class="terminal-line terminal-output" data-terminal-output>
      {{ output }}
    </p>
    <p class="terminal-hint">{{ terminal.hint }}</p>
  </div>
</template>
