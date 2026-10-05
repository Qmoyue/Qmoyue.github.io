export interface Project {
  name: string;
  description: string;
  tags: readonly string[];
  status: string;
  url: `https://${string}` | `/${string}`;
}
