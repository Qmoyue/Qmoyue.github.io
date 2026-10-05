export interface ThemePreset {
  id: string;
}

export interface BlogConfig {
  site: {
    name: string;
    displayName: string;
    description: string;
  };
  navigation: readonly {
    href: string;
    label: string;
  }[];
  preset: ThemePreset;
}

export function defineThemePreset<const T extends ThemePreset>(preset: T): T {
  if (!preset.id.trim()) throw new Error("Theme preset id is required");
  return preset;
}

export function defineBlogConfig<const T extends BlogConfig>(config: T): T {
  for (const [name, value] of Object.entries({
    name: config.site.name,
    displayName: config.site.displayName,
    description: config.site.description,
  })) {
    if (!value.trim()) throw new Error(`Site ${name} is required`);
  }

  for (const item of config.navigation) {
    if (!item.href.startsWith("/") || !item.label.trim()) {
      throw new Error("Navigation items need a local href and label");
    }
  }

  return config;
}
