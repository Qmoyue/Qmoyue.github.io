import type { IconName } from "../../components/shared/iconPaths";

export interface NavigationItem {
  href: string;
  label: string;
  subtitle: string;
  icon: IconName;
}
