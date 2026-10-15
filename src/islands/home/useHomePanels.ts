import { onMounted, onUnmounted, ref, type Ref } from "vue";

export type HomePanel = "first" | "second";

export function useHomePanels(root: Ref<HTMLElement | null>) {
  const panel = ref<HomePanel>("first");
  let locked = false;
  let lockTimer: ReturnType<typeof setTimeout> | undefined;
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let first: HTMLElement;
  let second: HTMLElement;

  function setPanel(next: HomePanel): void {
    panel.value = next;
  }

  function targetTop(next: HomePanel): number {
    const target = next === "first" ? first : second;
    return window.scrollY + target.getBoundingClientRect().top;
  }

  function dragTo(ratio: number): void {
    clearTimeout(lockTimer);
    locked = true;
    const start = targetTop("first");
    window.scrollTo({
      top: start + (targetTop("second") - start) * ratio,
      behavior: "instant",
    });
  }

  function goToPanel(next: HomePanel, dragging = false): void {
    if (locked && !dragging) return;
    const top = targetTop(next);
    locked = !reducedMotion();
    setPanel(next);
    window.scrollTo({ top, behavior: reducedMotion() ? "instant" : "smooth" });
    clearTimeout(lockTimer);
    if (!locked) return;

    const started = performance.now();
    function check(): void {
      if (
        Math.abs(window.scrollY - top) < 2 ||
        performance.now() - started > 1150
      ) {
        locked = false;
        return;
      }
      lockTimer = setTimeout(check, 80);
    }
    lockTimer = setTimeout(check, 180);
  }

  function onWheel(event: WheelEvent): void {
    if (event.defaultPrevented || event.ctrlKey) return;
    if (Math.abs(event.deltaY) < 8) return;
    const wantsSecond = event.deltaY > 0;
    const wantsFirst =
      event.deltaY < 0 && window.scrollY < window.innerHeight * 0.28;
    if (wantsSecond && panel.value === "first") {
      event.preventDefault();
      goToPanel("second");
    } else if (wantsFirst && panel.value === "second") {
      event.preventDefault();
      goToPanel("first");
    }
  }

  function onKeydown(event: KeyboardEvent): void {
    if (
      event.code !== "Space" ||
      event.defaultPrevented ||
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return;
    if (
      event.target instanceof Element &&
      event.target.closest(
        "button, a, input, textarea, select, [contenteditable]",
      )
    )
      return;
    event.preventDefault();
    goToPanel(panel.value === "first" ? "second" : "first");
  }

  function onScroll(): void {
    if (locked) return;
    setPanel(
      second.getBoundingClientRect().top < window.innerHeight * 0.42
        ? "second"
        : "first",
    );
  }

  onMounted(() => {
    const home = root.value;
    const firstElement = home?.querySelector<HTMLElement>(
      "[data-home-panel='first']",
    );
    const secondElement = home?.querySelector<HTMLElement>(
      "[data-home-panel='second']",
    );
    if (!firstElement || !secondElement)
      throw new Error("The home experience needs two panels");
    first = firstElement;
    second = secondElement;
    onScroll();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("scroll", onScroll, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("scroll", onScroll);
    clearTimeout(lockTimer);
  });

  return { panel, goToPanel, dragTo };
}
