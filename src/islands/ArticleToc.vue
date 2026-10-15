<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

const props = defineProps<{ headings: Heading[] }>();
const visibleHeadings = computed(() =>
  props.headings.filter(
    (heading) => heading.depth === 2 || heading.depth === 3,
  ),
);
const activeSlug = ref<string | null>(null);
let sections: HTMLElement[] = [];
let observer: ResizeObserver;
let frame = 0;

function updateActive(): void {
  frame = 0;
  const current = sections.findLast(
    (section) =>
      section.getBoundingClientRect().top <=
      Math.max(
        window.innerHeight * 0.12,
        parseFloat(getComputedStyle(section).scrollMarginTop) || 0,
      ) +
        2,
  );
  activeSlug.value = current?.id ?? null;
}

function scheduleUpdate(): void {
  if (!frame) frame = requestAnimationFrame(updateActive);
}

onMounted(() => {
  sections = visibleHeadings.value
    .map((heading) => document.getElementById(heading.slug))
    .filter((section): section is HTMLElement => section !== null);

  observer = new ResizeObserver(scheduleUpdate);
  observer.observe(document.body);
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  updateActive();
});

onUnmounted(() => {
  observer.disconnect();
  cancelAnimationFrame(frame);
  window.removeEventListener("scroll", scheduleUpdate);
  window.removeEventListener("resize", scheduleUpdate);
});
</script>

<template>
  <aside class="article-toc">
    <p class="toc-label">ON THIS PAGE</p>
    <nav v-if="visibleHeadings.length" aria-label="文章目录">
      <a
        v-for="heading in visibleHeadings"
        :key="heading.slug"
        :href="`#${heading.slug}`"
        :class="{
          'toc-depth-3': heading.depth === 3,
          'is-active': activeSlug === heading.slug,
        }"
        :aria-current="activeSlug === heading.slug ? 'location' : undefined"
      >
        <span>{{ heading.text }}</span>
        <b aria-hidden="true">#</b>
      </a>
    </nav>
    <p v-else class="toc-empty">这一页很轻，还没有目录。</p>
  </aside>
</template>

<style scoped>
.article-toc {
  position: sticky;
  top: 92px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  padding: 36px 30px;
  border: 1px solid #c8bcaa;
  border-radius: var(--radius);
  background:
    repeating-linear-gradient(
      2deg,
      transparent 0 42px,
      rgba(102, 91, 72, 0.018) 43px 44px,
      transparent 45px 106px
    ),
    linear-gradient(110deg, #f0ebe2, #e6dfd3 58%, #eee7dc);
  box-shadow:
    0 14px 28px rgba(81, 71, 58, 0.1),
    inset 0 1px 0 rgba(255, 253, 246, 0.78);
  scrollbar-color: #a49785 transparent;
}

.toc-label {
  margin: 0 0 26px;
  color: #6d5e4f;
  font-family: "Courier New", monospace;
  font-weight: 900;
  letter-spacing: 0.08em;
}

nav {
  display: grid;
  gap: 18px;
  padding-right: 8px;
}

a {
  display: grid;
  grid-template-columns: 4px 1fr auto;
  gap: 16px;
  align-items: start;
  color: #4b5663;
  font-weight: 900;
  line-height: 1.4;
}

a::before {
  width: 3px;
  height: 16px;
  margin-top: 3px;
  border-radius: 999px;
  content: "";
  background: #718993;
  opacity: 0;
}

a.is-active {
  color: #30465a;
}

a.is-active::before {
  opacity: 1;
}

a:hover {
  color: #30465a;
}

a:focus-visible {
  outline: 2px solid #718993;
  outline-offset: 5px;
  border-radius: 3px;
}

a span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.toc-depth-3 {
  padding-left: 18px;
}

.toc-empty {
  color: #5f655f;
}

.article-toc::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.article-toc::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #a49785;
}

.article-toc::-webkit-scrollbar-track {
  border-radius: 999px;
  background: transparent;
}

@media (max-width: 1180px) {
  .article-toc {
    position: relative;
    top: auto;
    order: -1;
    max-height: 380px;
  }
}
</style>
