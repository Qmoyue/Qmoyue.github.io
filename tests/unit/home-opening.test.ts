import { afterEach, expect, test, vi } from "vitest";
import { useOpeningTimeline } from "../../src/islands/home/useOpeningTimeline";
import { useTerminalSequence } from "../../src/islands/home/useTerminalSequence";

afterEach(() => vi.useRealTimers());

test("opening reaches named stages in order and can cancel pending stages", () => {
  vi.useFakeTimers();
  const timeline = useOpeningTimeline();
  timeline.start(false);

  expect(timeline.stage.value).toBe("brand");
  vi.advanceTimersByTime(2850);
  expect(timeline.stage.value).toBe("avatar");
  vi.advanceTimersByTime(1530);
  expect(timeline.stage.value).toBe("terminal");
  vi.advanceTimersByTime(320);
  expect(timeline.stage.value).toBe("terminalContent");
  timeline.cancel();
  vi.runAllTimers();
  expect(timeline.stage.value).toBe("terminalContent");
});

test("reduced motion settles immediately without scheduled animation", () => {
  vi.useFakeTimers();
  const timeline = useOpeningTimeline();
  timeline.start(true);
  expect(timeline.stage.value).toBe("settled");
  expect(vi.getTimerCount()).toBe(0);
});

test("terminal playback completes and cancellation stops later character changes", () => {
  vi.useFakeTimers();
  const terminal = useTerminalSequence({
    host: "author@blog",
    path: "~",
    command: "cat /flag",
    output: "flag{welcome}",
  });
  terminal.reset(false);
  terminal.start(() => 0.5);
  vi.advanceTimersByTime(100);
  expect(terminal.command.value.length).toBeGreaterThan(0);
  terminal.cancel();
  const commandAtCancel = terminal.command.value;
  vi.runAllTimers();
  expect(terminal.command.value).toBe(commandAtCancel);
  expect(terminal.output.value).toBe("");

  terminal.reset(false);
  terminal.start(() => 0.5);
  vi.advanceTimersByTime(900);
  expect(terminal.output.value.length).toBeLessThan("flag{welcome}".length);
  vi.runAllTimers();
  expect(terminal.command.value).toBe("cat /flag");
  expect(terminal.output.value).toMatch(/^flag\{[a-z0-9_]+\}$/);
  expect(terminal.output.value).not.toBe("flag{welcome}");

  terminal.reset(true);
  expect(terminal.command.value).toBe("cat /flag");
  expect(terminal.output.value).toMatch(/^flag\{[a-z0-9_]+\}$/);
  expect(terminal.output.value).not.toBe("flag{welcome}");
  expect(vi.getTimerCount()).toBe(0);
});
