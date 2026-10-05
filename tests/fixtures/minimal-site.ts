import { defineBlogConfig } from "../../src/framework/contracts/config";
import { neutralPreset } from "../../src/presets/neutral";

export const minimalSite = defineBlogConfig({
  preset: neutralPreset,
  site: {
    name: "Field Notes",
    displayName: "Alex",
    description: "A small static notebook.",
  },
  navigation: [{ href: "/", label: "Home" }],
});
