import { onMounted, onUnmounted, ref, type Ref } from "vue";

export type HomePanel = "first" | "second";

export function useHomePanels(root: Ref<HTMLElement | null>) {
  const panel = ref<HomePanel>("first");
  let locked = false;
  let lockTimer: ReturnType<typeof setTimeout> | undefined;
  let observer: IntersectionObserver | undefined;
  let reducedMotion = false;
  let first: HTMLElement;
  let second: HTMLElement;

  function setPanel(next: HomePanel): void {
    panel.value = next;
    document.body.dataset.homePanel = next;
  }

  function targetTop(next: HomePanel): number {
    const target = next === "first" ? first : second;
    return window.scrollY + target.getBoundingClientRect().top;
  }

  function goToPanel(next: HomePanel, dragging = false): void {
    if (locked && !dragging) return;
    const top = targetTop(next);
    locked = !reducedMotion;
    setPanel(next);
    window.scrollTo({ top, behavior: reducedMotion ? "instant" : "smooth" });
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
    if (event.code !== "Space") return;
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
    reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setPanel(window.scrollY > window.innerHeight * 0.42 ? "second" : "first");
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeydown);
    observer = new IntersectionObserver(
      (entries) => {
        if (locked) return;
        const active = entries.find(
          (entry) => entry.isIntersecting && entry.intersectionRatio > 0.62,
        );
        if (active?.target === first) setPanel("first");
        if (active?.target === second) setPanel("second");
      },
      { threshold: [0.62] },
    );
    observer.observe(first);
    observer.observe(second);
  });

  onUnmounted(() => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeydown);
    observer?.disconnect();
    clearTimeout(lockTimer);
    delete document.body.dataset.homePanel;
  });

  return { panel, goToPanel };
}
