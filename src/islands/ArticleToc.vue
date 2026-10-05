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
let observer: IntersectionObserver | undefined;

onMounted(() => {
  const sections = visibleHeadings.value
    .map((heading) => document.getElementById(heading.slug))
    .filter((section): section is HTMLElement => section !== null);

  observer = new IntersectionObserver(
    (entries) => {
      const firstVisible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (left, right) =>
            left.boundingClientRect.top - right.boundingClientRect.top,
        )[0];
      if (firstVisible) activeSlug.value = firstVisible.target.id;
    },
    { rootMargin: "-12% 0px -72% 0px", threshold: [0, 1] },
  );
  sections.forEach((section) => observer?.observe(section));
});

onUnmounted(() => observer?.disconnect());
</script>

<template>
  <aside class="article-toc soft-card">
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
}

.toc-label {
  margin: 0 0 26px;
  color: #6f6680;
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
  grid-template-columns: 14px 1fr auto;
  gap: 16px;
  align-items: start;
  color: #5c6e86;
  font-weight: 900;
  line-height: 1.4;
}

a::before {
  width: 13px;
  height: 18px;
  border-radius: 999px;
  content: "";
  background: var(--pink);
  opacity: 0;
}

a.is-active {
  color: var(--blue-deep);
}

a.is-active::before {
  opacity: 0.75;
}

a span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.toc-depth-3 {
  padding-left: 18px;
}

.toc-empty {
  color: var(--muted);
}

.article-toc::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.article-toc::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(232, 145, 183, 0.74),
    rgba(135, 202, 228, 0.74)
  );
}

.article-toc::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
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
