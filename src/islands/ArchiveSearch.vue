<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { iconPaths } from "../components/shared/iconPaths";
import { matchesSearch, normalizeSearch } from "../domain/blog/search";

const props = defineProps<{ total: number }>();
const root = ref<HTMLElement | null>(null);
const query = ref("");
const committed = ref("");
const visible = ref(props.total);
const ready = ref(false);

let cards: { element: HTMLElement; text: string }[] = [];

onMounted(() => {
  if (!root.value) throw new Error("ArchiveSearch root is missing");
  cards = Array.from(
    root.value.querySelectorAll<HTMLElement>("[data-note-card]"),
  ).map((element) => {
    const text = element.dataset.search;
    if (text === undefined)
      throw new Error("Archive card search text is missing");
    return { element, text };
  });
  if (cards.length !== props.total) {
    throw new Error(
      `ArchiveSearch expected ${props.total} cards, found ${cards.length}`,
    );
  }
  ready.value = true;
});

function commitSearch() {
  committed.value = normalizeSearch(query.value);
  let count = 0;
  for (const card of cards) {
    const matches = matchesSearch(card.text, committed.value);
    card.element.hidden = !matches;
    if (matches) count += 1;
  }
  visible.value = count;
}

function clearSearch() {
  if (query.value) return;
  commitSearch();
}

const countLabel = computed(() => {
  const pending = normalizeSearch(query.value);
  if (pending !== committed.value) {
    return pending
      ? `按 Enter 搜索 / 当前显示 ${visible.value} 篇`
      : `按 Enter 清空搜索 / 当前显示 ${visible.value} 篇`;
  }
  return committed.value
    ? `找到 ${visible.value} / ${props.total} 篇文章`
    : `共 ${props.total} 篇文章`;
});
</script>

<template>
  <div ref="root" class="archive-search">
    <section class="blog-search-card glass-card" aria-label="搜索笔记">
      <div class="search-title">
        <span class="search-icon">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.search" />
          </svg>
        </span>
        <div>
          <p class="section-label">SEARCH</p>
          <h2>翻找笔记</h2>
        </div>
      </div>
      <form class="search-field" role="search" @submit.prevent="commitSearch">
        <label for="blog-search">关键词</label>
        <input
          id="blog-search"
          v-model="query"
          :readonly="!ready"
          type="search"
          placeholder="请输入关键词喵~"
          data-blog-search
          @search="clearSearch"
        />
        <p class="search-count" data-search-count aria-live="polite">
          {{ countLabel }}
        </p>
      </form>
    </section>

    <slot />

    <p v-show="visible === 0" class="empty-state" data-blog-empty>
      没有翻到对应笔记，换个关键词试试。
    </p>
  </div>
</template>

<style src="./archive-search.css"></style>
