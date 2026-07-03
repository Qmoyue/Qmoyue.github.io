const toc = document.querySelector("[data-article-toc]");
const links = Array.from(toc?.querySelectorAll("a[href^='#']") ?? []);
const headings = links
  .map((link) => document.getElementById(decodeURIComponent(link.getAttribute("href").slice(1))))
  .filter(Boolean);

if (headings.length > 0 && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

      if (!visible) return;

      for (const link of links) {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
      }
    },
    { rootMargin: "-12% 0px -72% 0px", threshold: [0, 1] },
  );

  headings.forEach((heading) => observer.observe(heading));
}
