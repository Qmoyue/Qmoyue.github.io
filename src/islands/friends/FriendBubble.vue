<template>
  <span class="friend-bubble" aria-hidden="true">
    看看别的师傅都做了什么吧~
  </span>
</template>

<style scoped>
.friend-bubble {
  position: absolute;
  z-index: 4;
  top: -105px;
  left: 50%;
  width: max-content;
  max-width: min(90vw, 450px);
  padding: 19px 32px;
  border: 1px solid rgba(166, 128, 138, 0.45);
  border-radius: 50% / 48%;
  color: #52637b;
  background: rgba(255, 252, 248, 0.97);
  box-shadow: 0 9px 24px rgba(110, 85, 92, 0.14);
  font-size: clamp(1.04rem, 1.6vw, 1.24rem);
  font-weight: 750;
  line-height: 1.4;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 8px) scale(0.96);
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.friend-bubble::before,
.friend-bubble::after {
  position: absolute;
  border: 1px solid rgba(166, 128, 138, 0.45);
  border-radius: 50%;
  background: rgba(255, 252, 248, 0.97);
  content: "";
}

.friend-bubble::before {
  bottom: -14px;
  left: 22%;
  width: 16px;
  height: 16px;
}

.friend-bubble::after {
  bottom: -26px;
  left: 18%;
  width: 8px;
  height: 8px;
}

@media (max-width: 650px) {
  .friend-bubble {
    top: -90px;
    padding: 15px 19px;
    font-size: 0.98rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .friend-bubble {
    transition: none;
  }
}
</style>
