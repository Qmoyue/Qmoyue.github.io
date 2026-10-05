import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import FriendCard from "../../src/components/friends/FriendCard.astro";
import { friends } from "../../src/site/friends";

test("friend card keeps an external avatar explicit and links safely", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(FriendCard, {
    props: { friend: friends[0] },
  });

  expect(html).toContain(`href="${friends[0].url}"`);
  expect(html).toContain(`src="${friends[0].avatar}"`);
  expect(html).toContain("Nick Chen 的头像");
  expect(html).toContain('referrerpolicy="no-referrer"');
  expect(html).toContain('rel="noopener noreferrer"');
});

test("published friend links and remote avatars use HTTPS", () => {
  for (const friend of friends) {
    expect(new URL(friend.url).protocol).toBe("https:");
    expect(new URL(friend.avatar).protocol).toBe("https:");
  }
});
