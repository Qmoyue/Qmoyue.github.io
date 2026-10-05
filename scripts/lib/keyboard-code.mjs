function markCodeScrollRegion(node) {
  if (node.type !== "element") return;
  if (node.tagName === "pre") node.properties.tabIndex = 0;
  for (const child of node.children) markCodeScrollRegion(child);
}

export const keyboardCode = {
  name: "keyboard-code",
  hooks: {
    postprocessRenderedBlockGroup({ renderData }) {
      markCodeScrollRegion(renderData.groupAst);
    },
  },
};
