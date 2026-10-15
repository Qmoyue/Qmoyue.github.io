import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { expect, test } from "vitest";
import HomeExperience from "../../src/presets/moyue/HomeExperience.vue";
import { createHomePageModel } from "../../src/domain/home/model";
import { site, navItems } from "../../src/site/config";
import { homeContent } from "../../src/site/home";

test("home production components render core content and actions as static HTML", async () => {
  const model = createHomePageModel(
    site,
    homeContent,
    new Date(),
    navItems.filter((item) => item.href !== "/"),
  );
  const html = await renderToString(
    createSSRApp(HomeExperience, { model, thumbSrc: site.doro }),
  );

  expect(html).toContain(site.displayName);
  for (const link of model.links) expect(html).toContain(`href="${link.href}"`);
  expect(html).toContain(homeContent.terminal.output);
  expect(html).toContain('aria-label="显示头像留言"');
  expect(html).toContain('alt="花园里捧着花的人像"');
  expect(html).toContain('aria-label="日历"');
  expect(html).toContain('aria-label="页面滚动进度"');
  expect(html).toContain(homeContent.quote[0]);
  expect(html).toContain("data-falling-stage");
});
