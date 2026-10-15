<script setup lang="ts">
import { ref } from "vue";
import {
  NavigationMenu as UiNavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../components/ui/navigation-menu";
import { iconPaths } from "../components/shared/iconPaths";
import type { NavigationItem } from "../framework/contracts/navigation";
import { isActivePath } from "../lib/navigation";

const props = defineProps<{
  items: readonly NavigationItem[];
  currentPath: string;
}>();

const activeMenu = ref("");
const isActive = (href: string) => isActivePath(props.currentPath, href);
</script>

<template>
  <UiNavigationMenu
    v-model="activeMenu"
    class="top-nav"
    aria-label="主导航"
    :unmount-on-hide="false"
    :delay-duration="0"
    :disable-hover-trigger="true"
  >
    <NavigationMenuList class="nav-list">
      <NavigationMenuItem value="site" class="nav-entry">
        <NavigationMenuTrigger
          class="nav-trigger"
          :aria-label="activeMenu ? '关闭导航' : '打开导航'"
        />
        <NavigationMenuContent force-mount class="nav-panel">
          <NavigationMenuLink v-for="item in items" :key="item.href" as-child>
            <a
              class="nav-item"
              :class="{ 'is-active': isActive(item.href) }"
              :href="item.href"
              :aria-current="isActive(item.href) ? 'page' : undefined"
            >
              <span class="nav-icon">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="iconPaths[item.icon]" />
                </svg>
              </span>
              <span class="nav-copy">
                <strong>{{ item.label }}</strong>
                <small>{{ item.subtitle }}</small>
              </span>
            </a>
          </NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </UiNavigationMenu>
</template>

<style src="./navigation.css"></style>
