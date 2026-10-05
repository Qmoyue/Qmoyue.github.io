import { onMounted, onUnmounted, ref, shallowRef, type Ref } from "vue";
import type MatterTypes from "matter-js";

const colors = ["pink", "blue", "yellow", "mint", "lavender", "cream"] as const;

export interface FallingChip {
  id: number;
  text: string;
  color: (typeof colors)[number];
  wide: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
  opacity: number;
  fading: boolean;
}

export function makeFallingRandom(seed?: number): () => number {
  if (seed === undefined) return Math.random;
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function useMatterWorld(
  stage: Ref<HTMLElement | null>,
  words: readonly string[],
  seed?: number,
) {
  if (words.length === 0)
    throw new Error("Falling tags need at least one word");
  const chips = shallowRef<FallingChip[]>([]);
  const running = ref(false);
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let matter: typeof import("matter-js") | undefined;
  let engine: MatterTypes.Engine | undefined;
  let bodies: { body: MatterTypes.Body; chip: FallingChip }[] = [];
  let frame = 0;
  let generation = 0;
  let active = false;
  let fadeStarted = false;
  let startedAt = 0;
  let motion: MediaQueryList;

  function publish(): void {
    chips.value = bodies.map(({ chip }) => ({ ...chip }));
  }

  function later(callback: () => void, delay: number): void {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }

  function cleanup(): void {
    generation++;
    cancelAnimationFrame(frame);
    frame = 0;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
    if (engine && matter) {
      matter.Composite.clear(engine.world, false);
      matter.Engine.clear(engine);
    }
    engine = undefined;
    bodies = [];
    chips.value = [];
    running.value = false;
    fadeStarted = false;
  }

  function spawn(index: number, width: number, random: () => number): void {
    if (!matter || !engine || !running.value) return;
    const text = words[index % words.length];
    const wide = text.length > 12;
    const chipWidth = wide
      ? Math.min(300, 140 + text.length * 7)
      : 112 + Math.min(text.length, 10) * 7;
    const height = wide ? 48 : 42;
    const lane = (index * 0.618) % 1;
    const x = width * (0.16 + lane * 0.68) + (random() - 0.5) * 48;
    const y = -76 - random() * 126;
    const body = matter.Bodies.rectangle(x, y, chipWidth, height, {
      chamfer: { radius: 21 },
      restitution: 0.16,
      friction: 0.91,
      frictionAir: 0.02,
      density: 0.00112,
    });
    matter.Body.rotate(body, (random() - 0.5) * 1.2);
    matter.Body.setVelocity(body, { x: (random() - 0.5) * 2.6, y: 0 });
    matter.Body.setAngularVelocity(body, (random() - 0.5) * 0.075);
    const chip: FallingChip = {
      id: index,
      text,
      color: colors[index % colors.length],
      wide,
      width: chipWidth,
      height,
      x,
      y,
      angle: body.angle,
      opacity: 0,
      fading: false,
    };
    bodies.push({ body, chip });
    matter.Composite.add(engine.world, body);
    publish();
  }

  function fadeBottomFirst(): void {
    if (!matter || !engine || fadeStarted) return;
    fadeStarted = true;
    const sorted = [...bodies].sort(
      (a, b) => b.body.position.y - a.body.position.y,
    );
    for (const [index, item] of sorted.entries()) {
      later(() => {
        if (!matter || !engine) return;
        item.chip.fading = true;
        item.body.collisionFilter.mask = 0;
        item.body.collisionFilter.category = 0;
        matter.Body.setVelocity(item.body, {
          x: item.body.velocity.x * 0.25,
          y: Math.min(item.body.velocity.y, 1.2),
        });
        matter.Body.setAngularVelocity(
          item.body,
          item.body.angularVelocity * 0.35,
        );
        later(() => {
          if (engine && matter)
            matter.Composite.remove(engine.world, item.body);
          bodies = bodies.filter((entry) => entry !== item);
          publish();
        }, 1200);
      }, index * 100);
    }
    later(cleanup, sorted.length * 100 + 1800);
  }

  function tick(now: number): void {
    if (!matter || !engine || !running.value) return;
    matter.Engine.update(engine, 1000 / 60);
    for (const { body, chip } of bodies) {
      chip.x = body.position.x;
      chip.y = body.position.y;
      chip.angle = body.angle;
      if (!chip.fading && body.position.y > -40) chip.opacity = 0.96;
    }
    publish();
    if (!fadeStarted && now - startedAt > 5100) fadeBottomFirst();
    frame = requestAnimationFrame(tick);
  }

  async function start(): Promise<void> {
    if (!active || running.value || motion.matches) return;
    cleanup();
    const currentGeneration = generation;
    const { default: loadedMatter } = await import("matter-js");
    if (!active || motion.matches || currentGeneration !== generation) return;
    matter = loadedMatter;
    const element = stage.value;
    if (!element) throw new Error("Falling tags stage is missing");
    const rect = element.getBoundingClientRect();
    const width = Math.max(rect.width, window.innerWidth, 320);
    const height = Math.max(rect.height, window.innerHeight, 480);
    const random = makeFallingRandom(seed);

    const newEngine = matter.Engine.create({ enableSleeping: true });
    engine = newEngine;
    newEngine.gravity.y = 1.06;
    newEngine.positionIterations = 4;
    newEngine.velocityIterations = 3;
    newEngine.constraintIterations = 1;
    const floor = matter.Bodies.rectangle(
      width / 2,
      height - 46,
      width + 220,
      68,
      {
        isStatic: true,
        friction: 0.94,
        restitution: 0.03,
      },
    );
    const left = matter.Bodies.rectangle(-42, height / 2, 84, height * 1.45, {
      isStatic: true,
    });
    const right = matter.Bodies.rectangle(
      width + 42,
      height / 2,
      84,
      height * 1.45,
      {
        isStatic: true,
      },
    );
    matter.Composite.add(newEngine.world, [floor, left, right]);
    running.value = true;
    startedAt = performance.now();
    const count = Math.min(10, Math.max(8, words.length));
    for (let index = 0; index < count; index++) {
      later(() => spawn(index, width, random), index * 128);
    }
    frame = requestAnimationFrame(tick);
  }

  function setActive(next: boolean): void {
    active = next;
    if (next) void start();
    else cleanup();
  }

  function onResize(): void {
    if (!active || motion.matches) return;
    cleanup();
    later(() => void start(), 180);
  }

  function onMotionChange(): void {
    if (motion.matches) cleanup();
    else if (active) void start();
  }

  onMounted(() => {
    motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", onMotionChange);
    window.addEventListener("resize", onResize);
  });
  onUnmounted(() => {
    active = false;
    cleanup();
    motion.removeEventListener("change", onMotionChange);
    window.removeEventListener("resize", onResize);
  });

  return { chips, running, setActive, cleanup };
}
