const body = document.body;
const root = document.querySelector("[data-home-root]");
const first = document.querySelector("[data-home-panel='first']");
const second = document.querySelector("[data-home-panel='second']");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activePanel = window.scrollY > window.innerHeight * 0.42 ? "second" : "first";
let transitionLocked = false;
let lockTimer = 0;

function setPanel(panel) {
  activePanel = panel;
  body.dataset.homePanel = panel;
  root?.classList.toggle("is-second", panel === "second");
  root?.classList.toggle("is-first", panel !== "second");
  document.documentElement.style.setProperty("--scroll-progress", panel === "second" ? "100%" : "0%");
  window.dispatchEvent(new CustomEvent("home:panel-change", { detail: panel }));
}

function panelTop(panel) {
  const target = panel === "second" ? second : first;
  if (!target) return 0;
  return window.scrollY + target.getBoundingClientRect().top;
}

function unlockAfterScroll(targetTop) {
  window.clearTimeout(lockTimer);
  const startedAt = performance.now();

  function check() {
    const distance = Math.abs(window.scrollY - targetTop);
    if (distance < 2 || performance.now() - startedAt > 1150 || reduceMotion) {
      transitionLocked = false;
      return;
    }
    lockTimer = window.setTimeout(check, 80);
  }

  lockTimer = window.setTimeout(check, 180);
}

function goToPanel(panel) {
  if (panel === activePanel && transitionLocked) return;
  if (transitionLocked && panel !== activePanel) return;

  const targetTop = panelTop(panel);
  transitionLocked = !reduceMotion;
  setPanel(panel);
  window.scrollTo({ top: targetTop, behavior: reduceMotion ? "auto" : "smooth" });
  unlockAfterScroll(targetTop);
}

window.addEventListener("home:set-panel", (event) => {
  goToPanel(event.detail === "second" ? "second" : "first");
});

window.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) < 8) return;
    const wantsSecond = event.deltaY > 0;
    const wantsFirst = event.deltaY < 0 && window.scrollY < window.innerHeight * 0.28;

    if (wantsSecond && activePanel !== "second") {
      event.preventDefault();
      goToPanel("second");
    } else if (wantsFirst && activePanel !== "first") {
      event.preventDefault();
      goToPanel("first");
    }
  },
  { passive: false },
);

window.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }
  event.preventDefault();
  goToPanel(activePanel === "second" ? "first" : "second");
});

const observer = new IntersectionObserver(
  (entries) => {
    if (transitionLocked) return;
    const active = entries.find((entry) => entry.isIntersecting && entry.intersectionRatio > 0.62);
    if (active?.target === second) setPanel("second");
    if (active?.target === first) setPanel("first");
  },
  { threshold: [0.62] },
);

if (first) observer.observe(first);
if (second) observer.observe(second);
setPanel(activePanel);
