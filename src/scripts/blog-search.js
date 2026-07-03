const search = document.querySelector("[data-blog-search]");
const cards = Array.from(document.querySelectorAll("[data-note-card]"));
const empty = document.querySelector("[data-blog-empty]");
const count = document.querySelector("[data-search-count]");

let committedKeyword = "";

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[#_\-\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function visibleCards() {
  return cards.filter((card) => !card.hidden).length;
}

function setCount(message) {
  if (count) count.textContent = message;
}

function applySearch(keyword = committedKeyword) {
  const terms = keyword ? keyword.split(" ").filter(Boolean) : [];
  let visible = 0;

  for (const card of cards) {
    const text = normalize(card.dataset.search ?? "");
    const match = terms.length === 0 || terms.every((term) => text.includes(term));
    card.hidden = !match;
    if (match) visible += 1;
  }

  if (empty) empty.hidden = visible !== 0;
  setCount(keyword ? `找到 ${visible} / ${cards.length} 篇文章` : `共 ${cards.length} 篇文章`);
}

function showPendingState() {
  const pendingKeyword = normalize(search?.value ?? "");
  if (pendingKeyword === committedKeyword) return;
  setCount(pendingKeyword ? `按 Enter 搜索 / 当前显示 ${visibleCards()} 篇` : `按 Enter 清空搜索 / 当前显示 ${visibleCards()} 篇`);
}

search?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  committedKeyword = normalize(search.value ?? "");
  applySearch(committedKeyword);
});

search?.addEventListener("input", showPendingState);
search?.addEventListener("search", () => {
  if (search.value) return;
  committedKeyword = "";
  applySearch("");
});

applySearch("");
