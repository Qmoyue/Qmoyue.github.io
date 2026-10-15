<script setup lang="ts">
import { computed, ref } from "vue";
import type { FriendLink } from "../../framework/contracts/friend";
import FriendBubble from "./FriendBubble.vue";
import FriendPortrait from "./FriendPortrait.vue";

const props = defineProps<{ friends: readonly FriendLink[] }>();
if (props.friends.length === 0)
  throw new Error("FriendsCarousel needs at least one friend");
const activeIndex = ref(0);
const active = computed(() => props.friends[activeIndex.value]!);
const previous = computed(
  () =>
    props.friends[
      (activeIndex.value - 1 + props.friends.length) % props.friends.length
    ]!,
);
const next = computed(
  () => props.friends[(activeIndex.value + 1) % props.friends.length]!,
);

function move(direction: -1 | 1) {
  activeIndex.value =
    (activeIndex.value + direction + props.friends.length) %
    props.friends.length;
}
</script>

<template>
  <section
    class="friends-carousel"
    aria-label="友链轮播"
    @keydown.left.prevent="move(-1)"
    @keydown.right.prevent="move(1)"
  >
    <button
      v-if="friends.length > 1"
      class="friend-neighbor friend-neighbor--previous"
      type="button"
      :aria-label="`查看上一位友链：${previous.name}`"
      @click="move(-1)"
    >
      <FriendPortrait :name="previous.name" :avatar="previous.avatar" />
    </button>

    <button
      v-if="friends.length > 1"
      class="friend-neighbor friend-neighbor--next"
      type="button"
      :aria-label="`查看下一位友链：${next.name}`"
      @click="move(1)"
    >
      <FriendPortrait :name="next.name" :avatar="next.avatar" />
    </button>

    <button
      v-if="friends.length > 1"
      class="friend-arrow friend-arrow--previous"
      type="button"
      :aria-label="`上一位：${previous.name}`"
      @click="move(-1)"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m15 5-7 7 7 7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Transition name="friend-swap" mode="out-in">
      <div :key="active.url" class="friend-current" aria-live="polite">
        <component
          :is="active.unavailable ? 'div' : 'a'"
          class="friend-current-link"
          :href="active.unavailable ? undefined : active.url"
          :target="active.unavailable ? undefined : '_blank'"
          :rel="active.unavailable ? undefined : 'noopener noreferrer'"
          :aria-label="
            active.unavailable
              ? undefined
              : `访问 ${active.name} 的博客（新窗口）`
          "
        >
          <FriendPortrait :name="active.name" :avatar="active.avatar" reflect />
          <FriendBubble />
        </component>
        <h2>{{ active.name }}</h2>
        <p v-if="active.signature" class="friend-signature">
          {{ active.signature }}
        </p>
      </div>
    </Transition>

    <button
      v-if="friends.length > 1"
      class="friend-arrow friend-arrow--next"
      type="button"
      :aria-label="`下一位：${next.name}`"
      @click="move(1)"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m9 5 7 7-7 7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </section>
</template>

<style scoped>
.friends-carousel {
  --portrait-size: clamp(250px, 24vw, 330px);
  --side-size: clamp(165px, 18vw, 225px);
  --reflection-height: 70px;
  position: relative;
  width: 100%;
  min-height: calc(var(--portrait-size) + var(--reflection-height) + 210px);
  margin: 0 auto;
  padding-top: 48px;
  overflow: visible;
  isolation: isolate;
  animation: carousel-enter 850ms 1900ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.friends-carousel::before {
  position: absolute;
  z-index: -1;
  right: 9%;
  bottom: 95px;
  left: 9%;
  height: 66px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    rgba(177, 147, 143, 0.13),
    transparent 70%
  );
  content: "";
}

.friend-current {
  position: relative;
  z-index: 2;
  display: grid;
  width: fit-content;
  max-width: 78%;
  justify-items: center;
  margin: 0 auto;
  text-align: center;
}

.friend-current-link {
  position: relative;
  display: block;
  width: var(--portrait-size);
  border-radius: 50%;
}

a.friend-current-link {
  cursor: pointer;
}

a.friend-current-link:hover :deep(.portrait-face),
a.friend-current-link:focus-visible :deep(.portrait-face) {
  box-shadow:
    0 26px 50px rgba(107, 77, 84, 0.24),
    0 4px 12px rgba(92, 83, 102, 0.12);
  transform: translateY(-4px);
}

a.friend-current-link:focus-visible {
  outline: 3px solid #c987a6;
  outline-offset: 6px;
}

.friend-current-link :deep(.portrait-face) {
  transition:
    transform 220ms ease,
    box-shadow 220ms ease;
}

.friend-current-link:hover :deep(.friend-bubble),
.friend-current-link:focus-visible :deep(.friend-bubble) {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

h2 {
  max-width: 15ch;
  margin: 8px 0 0;
  color: var(--blue-deep);
  font-size: clamp(2rem, 4vw, 3.3rem);
  font-weight: 900;
  line-height: 1.1;
  overflow-wrap: anywhere;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.66);
}

.friend-signature {
  margin: 10px 0 0;
  color: #666d78;
  font-size: clamp(0.96rem, 1.7vw, 1.12rem);
  line-height: 1.6;
}

.friend-neighbor {
  --portrait-size: var(--side-size);
  position: absolute;
  z-index: 1;
  top: calc(48px + clamp(250px, 24vw, 330px) * 0.2);
  display: block;
  width: var(--portrait-size);
  height: var(--portrait-size);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  opacity: 0.68;
  transition:
    opacity 220ms ease,
    transform 220ms ease;
  animation: neighbor-enter 650ms 2200ms backwards;
}

.friend-neighbor--previous {
  left: calc(50% - clamp(250px, 24vw, 330px) / 2 - var(--side-size) - 89px);
}

.friend-neighbor--next {
  right: calc(50% - clamp(250px, 24vw, 330px) / 2 - var(--side-size) - 89px);
}

.friend-neighbor:hover,
.friend-neighbor:focus-visible {
  opacity: 1;
  transform: scale(1.04);
}

.friend-neighbor:focus-visible {
  outline: 3px solid #c987a6;
  outline-offset: 4px;
}

.friend-arrow {
  position: absolute;
  z-index: 3;
  top: calc(48px + clamp(250px, 24vw, 330px) * 0.42);
  display: grid;
  width: 54px;
  height: 54px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(151, 117, 116, 0.25);
  border-radius: 50%;
  color: #667b90;
  background: rgba(255, 251, 247, 0.84);
  box-shadow: 0 8px 20px rgba(109, 82, 90, 0.09);
  backdrop-filter: blur(8px);
  transition:
    background 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
  animation: controls-enter 420ms 2350ms backwards;
}

.friend-arrow--previous {
  left: clamp(18px, 4vw, 68px);
}

.friend-arrow--next {
  right: clamp(18px, 4vw, 68px);
}

.friend-arrow svg {
  width: 27px;
  height: 27px;
}

.friend-arrow:hover,
.friend-arrow:focus-visible {
  background: #fffaf6;
  box-shadow: 0 10px 24px rgba(109, 82, 90, 0.17);
  transform: translateY(-2px);
}

.friend-arrow:active {
  transform: translateY(1px) scale(0.97);
}

.friend-arrow:focus-visible {
  outline: 3px solid #c987a6;
  outline-offset: 4px;
}

.friend-swap-enter-active,
.friend-swap-leave-active {
  transition:
    opacity 170ms ease,
    transform 170ms ease;
}

.friend-swap-enter-from,
.friend-swap-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

@keyframes carousel-enter {
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.96);
  }
}

@keyframes neighbor-enter {
  from {
    opacity: 0;
    transform: scale(0.86);
  }
}

@keyframes controls-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}

@media (min-width: 651px) and (max-width: 900px) {
  .friends-carousel {
    --side-size: min(19vw, 160px);
  }

  .friend-neighbor--previous {
    left: max(80px, 12vw);
  }

  .friend-neighbor--next {
    right: max(80px, 12vw);
  }
}

@media (max-width: 650px) {
  .friends-carousel {
    --portrait-size: min(64vw, 250px);
    --reflection-height: 54px;
    min-height: calc(var(--portrait-size) + var(--reflection-height) + 175px);
    padding-top: 60px;
  }

  .friend-neighbor {
    --portrait-size: 154px;
    top: 86px;
  }

  .friend-neighbor--previous {
    left: -112px;
  }

  .friend-neighbor--next {
    right: -112px;
  }

  .friend-arrow {
    top: calc(60px + min(64vw, 250px) * 0.72);
    width: 44px;
    height: 44px;
  }

  .friend-arrow--previous {
    left: 12px;
  }

  .friend-arrow--next {
    right: 34px;
  }

  .friend-arrow svg {
    width: 24px;
    height: 24px;
  }

  h2 {
    margin-top: 5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .friends-carousel,
  .friend-neighbor,
  .friend-arrow {
    animation: none;
  }

  .friend-swap-enter-active,
  .friend-swap-leave-active,
  .friend-neighbor,
  .friend-arrow,
  .friend-current-link :deep(.portrait-face) {
    transition: none;
  }
}
</style>
