import Matter from "matter-js";

const stage = document.querySelector("[data-falling-stage]");
const source = document.querySelector("[data-falling-source]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (stage && source && !reduceMotion) {
  const { Engine, Bodies, Body, Composite } = Matter;
  const words = JSON.parse(source.textContent || "[]").filter(Boolean);
  const colors = ["pink", "blue", "yellow", "mint", "lavender", "cream"];
  const itemCount = Math.min(10, Math.max(8, words.length));

  let engine = null;
  let frame = 0;
  let running = false;
  let fadeStarted = false;
  let startedAt = 0;
  let bodies = [];
  let timers = [];

  function later(callback, delay) {
    const timer = window.setTimeout(callback, delay);
    timers.push(timer);
  }

  function clearTimers() {
    for (const timer of timers) window.clearTimeout(timer);
    timers = [];
  }

  function makeElement(index) {
    const text = words[index % words.length] ?? "sakura";
    const element = document.createElement("span");
    const label = document.createElement("b");
    const wide = text.length > 12;

    element.className = `falling-item is-${colors[index % colors.length]}`;
    if (wide) element.classList.add("is-wide");
    label.textContent = text;
    element.append(label);

    return {
      element,
      width: wide ? Math.min(300, 140 + text.length * 7) : 112 + Math.min(text.length, 10) * 7,
      height: wide ? 48 : 42,
    };
  }

  function cleanup() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    clearTimers();

    if (engine) {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      engine = null;
    }

    bodies = [];
    running = false;
    fadeStarted = false;
    stage.classList.remove("is-physics-running");
    stage.replaceChildren();
  }

  function createWorld(width, height) {
    engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 1.06;
    engine.positionIterations = 4;
    engine.velocityIterations = 3;
    engine.constraintIterations = 1;

    const floor = Bodies.rectangle(width / 2, height - 46, width + 220, 68, {
      isStatic: true,
      friction: 0.94,
      restitution: 0.03,
    });
    const leftWall = Bodies.rectangle(-42, height / 2, 84, height * 1.45, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 42, height / 2, 84, height * 1.45, { isStatic: true });

    Composite.add(engine.world, [floor, leftWall, rightWall]);
  }

  function spawnBody(index, width) {
    if (!engine || !running || words.length === 0) return;

    const chip = makeElement(index);
    const lane = (index * 0.618) % 1;
    const startX = width * (0.16 + lane * 0.68) + (Math.random() - 0.5) * 48;
    const startY = -76 - Math.random() * 126;
    const body = Bodies.rectangle(startX, startY, chip.width, chip.height, {
      chamfer: { radius: 21 },
      restitution: 0.16,
      friction: 0.91,
      frictionAir: 0.02,
      density: 0.00112,
    });

    Body.rotate(body, (Math.random() - 0.5) * 1.2);
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 2.6, y: 0 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.075);

    chip.element.style.width = `${chip.width}px`;
    chip.element.style.height = `${chip.height}px`;
    body.plugin = { element: chip.element };

    bodies.push(body);
    stage.append(chip.element);
    Composite.add(engine.world, body);
  }

  function fadeBottomFirst() {
    if (fadeStarted || !engine) return;
    fadeStarted = true;

    const sorted = [...bodies].sort((a, b) => b.position.y - a.position.y);
    sorted.forEach((body, index) => {
      later(() => {
        const element = body.plugin?.element;
        if (!element) return;
        element.classList.add("is-physics-fading");
        body.collisionFilter.mask = 0;
        body.collisionFilter.category = 0;
        Body.setVelocity(body, { x: body.velocity.x * 0.25, y: Math.min(body.velocity.y, 1.2) });
        Body.setAngularVelocity(body, body.angularVelocity * 0.35);
        later(() => {
          if (engine) Composite.remove(engine.world, body);
          element.remove();
          bodies = bodies.filter((item) => item !== body);
        }, 1200);
      }, index * 100);
    });

    later(cleanup, sorted.length * 100 + 1800);
  }

  function tick(now) {
    if (!engine || !running) return;

    Engine.update(engine, 1000 / 60);

    for (const body of bodies) {
      const element = body.plugin?.element;
      if (!element) continue;
      if (!element.classList.contains("is-physics-fading") && body.position.y > -40) {
        element.style.opacity = "0.96";
      }
      element.style.transform = `translate3d(${body.position.x}px, ${body.position.y}px, 0) translate(-50%, -50%) rotate(${body.angle}rad)`;
    }

    if (!fadeStarted && now - startedAt > 5100) fadeBottomFirst();
    frame = window.requestAnimationFrame(tick);
  }

  function startDrop() {
    if (running || !stage.isConnected || words.length === 0) return;
    cleanup();

    const rect = stage.getBoundingClientRect();
    const width = Math.max(rect.width, window.innerWidth, 320);
    const height = Math.max(rect.height, window.innerHeight, 480);

    running = true;
    startedAt = performance.now();
    stage.classList.add("is-physics-running");
    createWorld(width, height);

    for (let index = 0; index < itemCount; index += 1) {
      later(() => spawnBody(index, width), index * 128);
    }

    frame = window.requestAnimationFrame(tick);
  }

  window.addEventListener("home:panel-change", () => {
    if (document.body.dataset.homePanel === "second") startDrop();
    else cleanup();
  });

  window.addEventListener("resize", () => {
    if (document.body.dataset.homePanel !== "second") return;
    cleanup();
    later(startDrop, 180);
  });

  window.addEventListener("pagehide", cleanup);
  if (document.body.dataset.homePanel === "second") startDrop();
}