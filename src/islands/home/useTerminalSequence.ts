import { ref } from "vue";
import type { HomePageModel } from "../../framework/contracts/home";

const leet: Record<string, string> = {
  a: "4",
  e: "3",
  i: "1",
  l: "1",
  o: "0",
  s: "5",
  t: "7",
};
const glyphs = "013457";

function varyFlag(value: string, random: () => number): string {
  const chars = [...value];
  const positions = chars.flatMap((char, index) =>
    index > 4 && index < chars.length - 1 && leet[char] ? [index] : [],
  );

  for (let index = positions.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [positions[index], positions[other]] = [positions[other], positions[index]];
  }
  for (const position of positions.slice(
    0,
    Math.round(positions.length * 0.28),
  )) {
    chars[position] = leet[chars[position]];
  }
  return chars.join("");
}

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
    output.value = reducedMotion ? varyFlag(terminal.output, Math.random) : "";
  }

  function start(random: () => number = Math.random): void {
    cancel();
    command.value = "";
    output.value = "";
    const result = varyFlag(terminal.output, random);
    let elapsed = 0;
    for (const char of terminal.command) {
      elapsed += 46 + random() * 18;
      const next = char;
      later(() => (command.value += next), elapsed);
    }

    elapsed += 180;
    for (const [index, char] of [...result].entries()) {
      elapsed += 44;
      const settled = result.slice(0, index);
      if (/[a-z0-9]/.test(char) && index % 3 === 0) {
        const glyph = glyphs[Math.floor(random() * glyphs.length)];
        later(() => (output.value = settled + glyph), elapsed);
        later(() => (output.value = settled + char), elapsed + 22);
      } else {
        later(() => (output.value = settled + char), elapsed);
      }
    }
  }

  return { command, output, reset, start, cancel };
}
