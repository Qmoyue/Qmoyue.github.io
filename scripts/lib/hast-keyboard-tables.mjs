import { defineHastPlugin } from "satteri";

export const keyboardTables = defineHastPlugin({
  name: "keyboard-tables",
  element: {
    filter: ["table"],
    visit(node, context) {
      context.setProperty(node, "tabIndex", 0);
    },
  },
});
