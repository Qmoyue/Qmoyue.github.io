import { afterEach, expect, test, vi } from "vitest";
import { useOpeningTimeline } from "../../src/islands/home/useOpeningTimeline";
import { useTerminalSequence } from "../../src/islands/home/useTerminalSequence";
import { homeContent } from "../../src/site/home";

afterEach(() => vi.useRealTimers());

test("opening completes, cancels pending playback and settles with reduced motion", () => {
  vi.useFakeTimers();
  const timeline = useOpeningTimeline();
  timeline.start(false);

  expect(timeline.stage.value).toBe("brand");
  vi.runAllTimers();
  expect(timeline.stage.value).toBe("settled");

  timeline.start(false);
  vi.advanceTimersToNextTimer();
  const stageAtCancel = timeline.stage.value;
  expect(stageAtCancel).not.toBe("brand");
  expect(stageAtCancel).not.toBe("settled");
  timeline.cancel();
  vi.runAllTimers();
  expect(timeline.stage.value).toBe(stageAtCancel);

  timeline.start(false);
  timeline.start(true);
  expect(timeline.stage.value).toBe("settled");
  expect(vi.getTimerCount()).toBe(0);
});

test("terminal playback completes and cancellation stops later character changes", () => {
  vi.useFakeTimers();
  const terminal = useTerminalSequence(homeContent.terminal);
  terminal.reset(false);
  terminal.start(() => 0.5);
  vi.advanceTimersToNextTimer();
  expect(terminal.command.value.length).toBeGreaterThan(0);
  terminal.cancel();
  const commandAtCancel = terminal.command.value;
  vi.runAllTimers();
  expect(terminal.command.value).toBe(commandAtCancel);
  expect(terminal.output.value).toBe("");

  terminal.reset(false);
  terminal.start(() => 0.5);
  vi.runAllTimers();
  expect(terminal.command.value).toBe(homeContent.terminal.command);
  expect(terminal.output.value).toMatch(/^flag\{[a-z0-9_]+\}$/);
  expect(terminal.output.value).not.toBe(homeContent.terminal.output);

  terminal.reset(true);
  expect(terminal.command.value).toBe(homeContent.terminal.command);
  expect(terminal.output.value).toMatch(/^flag\{[a-z0-9_]+\}$/);
  expect(terminal.output.value).not.toBe(homeContent.terminal.output);
  expect(vi.getTimerCount()).toBe(0);
});
