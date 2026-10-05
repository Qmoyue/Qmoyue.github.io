import { ref } from "vue";
import type { HomePageModel } from "../../framework/contracts/home";

const glyphs = "abcdefghijklmnopqrstuvwxyz0123456789_{}#$%&*@";

export function useTerminalSequence(terminal: HomePageModel["terminal"]) {
  const command = ref(terminal.command);
  const output = ref(terminal.output);
  const timers: ReturnType<typeof setTimeout>[] = [];

  function later(callback: () => void, delay: number): void {
    timers.push(setTimeout(callback, delay));
  }

  function cancel(): void {
    for (const timer of timers) clearTimeout(timer);
    timers.length = 0;
  }

  function reset(reducedMotion: boolean): void {
    cancel();
    command.value = reducedMotion ? terminal.command : "";
    output.value = reducedMotion ? terminal.output : "";
  }

  function start(random: () => number = Math.random): void {
    cancel();
    let elapsed = 0;
    for (const char of terminal.command) {
      elapsed += 46 + random() * 18;
      const next = char;
      later(() => (command.value += next), elapsed);
    }

    elapsed += 220;
    for (let frame = 0; frame < 36; frame += 1) {
      const progress = Math.floor((frame / 35) * terminal.output.length);
      later(
        () => {
          output.value = [...terminal.output]
            .map((char, index) => {
              if (char === "{" || char === "}" || char === "_") return char;
              if (index < progress) return char;
              return glyphs[Math.floor(random() * glyphs.length)];
            })
            .join("");
        },
        elapsed + frame * 42,
      );
    }
    later(() => (output.value = terminal.output), elapsed + 36 * 42);
  }

  return { command, output, reset, start, cancel };
}
