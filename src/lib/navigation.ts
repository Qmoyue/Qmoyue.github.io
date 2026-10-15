export function isActivePath(currentPath: string, href: string): boolean {
  const normalize = (path: string) => path.replace(/\/+$/, "") || "/";
  const current = normalize(currentPath);
  const target = normalize(href);
  return (
    current === target || (target !== "/" && current.startsWith(`${target}/`))
  );
}
