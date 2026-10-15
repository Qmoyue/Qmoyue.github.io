import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { expect, test } from "vitest";
import FriendsCarousel from "../../src/islands/friends/FriendsCarousel.vue";
import { friends } from "../../src/site/friends";

test("a single published friend renders a link without duplicate controls", async () => {
  const html = await renderToString(
    createSSRApp(FriendsCarousel, { friends: friends.slice(0, 1) }),
  );
  expect(html).toContain(friends[0].url);
  expect(html).not.toContain("<button");
});

test("empty friend content fails explicitly before publishing", async () => {
  await expect(
    renderToString(createSSRApp(FriendsCarousel, { friends: [] })),
  ).rejects.toThrow("FriendsCarousel needs at least one friend");
});
