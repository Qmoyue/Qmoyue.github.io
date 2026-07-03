const rail = document.querySelector("[data-scroll-rail]");
const track = rail?.querySelector(".scroll-rail-track");
let wheelRunTimer = 0;

function getProgress() {
  const root = document.documentElement;
  const max = root.scrollHeight - window.innerHeight;
  if (max <= 0) return document.body.dataset.homePanel === "second" ? 1 : 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

function updateRail() {
  document.documentElement.style.setProperty("--scroll-progress", `${getProgress() * 100}%`);
}

function seekFromPointer(event) {
  if (!track) return;
  const rect = track.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

  if (document.body.classList.contains("home-page")) {
    window.dispatchEvent(new CustomEvent("home:set-panel", { detail: ratio > 0.45 ? "second" : "first" }));
    document.documentElement.style.setProperty("--scroll-progress", `${ratio * 100}%`);
    return;
  }

  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: max * ratio, behavior: "smooth" });
}

let dragging = false;

function setRunning(value) {
  rail?.classList.toggle("is-running", value);
}

function setDragging(value) {
  dragging = value;
  rail?.classList.toggle("is-dragging", value);
  setRunning(value);
}

rail?.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  setDragging(true);
  rail.setPointerCapture(event.pointerId);
  seekFromPointer(event);
});

rail?.addEventListener("pointermove", (event) => {
  if (dragging) seekFromPointer(event);
});

function endDrag(event) {
  if (!dragging) return;
  setDragging(false);
  if (rail?.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
  updateRail();
}

rail?.addEventListener("pointerup", endDrag);
rail?.addEventListener("pointercancel", endDrag);
rail?.addEventListener("lostpointercapture", () => setDragging(false));

window.addEventListener("scroll", updateRail, { passive: true });
window.addEventListener(
  "wheel",
  () => {
    if (dragging) return;
    setRunning(true);
    window.clearTimeout(wheelRunTimer);
    wheelRunTimer = window.setTimeout(() => setRunning(false), 420);
  },
  { passive: true },
);
window.addEventListener("resize", updateRail);
window.addEventListener("home:panel-change", updateRail);
updateRail();
