import { ref } from "vue";

export type OpeningStage =
  "brand" | "avatar" | "terminal" | "terminalContent" | "cue" | "settled";

const stages: readonly { stage: OpeningStage; at: number }[] = [
  { stage: "avatar", at: 2850 },
  { stage: "terminal", at: 4380 },
  { stage: "terminalContent", at: 4700 },
  { stage: "cue", at: 5900 },
  { stage: "settled", at: 6700 },
];

export function useOpeningTimeline() {
  const stage = ref<OpeningStage>("brand");
  const timers: ReturnType<typeof setTimeout>[] = [];

  function cancel(): void {
    for (const timer of timers) clearTimeout(timer);
    timers.length = 0;
  }

  function start(reducedMotion: boolean): void {
    cancel();
    stage.value = reducedMotion ? "settled" : "brand";
    if (reducedMotion) return;
    for (const step of stages) {
      timers.push(setTimeout(() => (stage.value = step.stage), step.at));
    }
  }

  return { stage, start, cancel };
}
